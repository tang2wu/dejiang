import { Client } from '@notionhq/client'
import type { BlogPost, BlogPostMeta } from '~/types/blog'

interface NotionRichText {
  plain_text: string
}

interface NotionPage {
  id: string
  properties: Record<string, any>
  cover?: {
    type: string
    external?: { url: string }
    file?: { url: string }
  } | null
}

const PROPERTY_ALIASES = {
  title: ['Title', 'Name', '标题', '名称'],
  status: ['Status', '状态'],
  slug: ['Slug', 'slug', '路径'],
  summary: ['Summary', '摘要', 'Description', '描述'],
  date: ['Date', '日期', 'Published', '发布日期'],
  tags: ['Tags', '标签', 'Tag'],
} as const

const PUBLISHED_STATUS_PATTERN = /published|发布|公开/i

const PLACEHOLDER_POSTS: BlogPost[] = [
  {
    id: 'placeholder-1',
    title: '从车端看数据闭环：采集只是起点',
    slug: 'vehicle-side-data-loop',
    summary: '占位文章：说明站点已接好博客路由；配置 Notion 后会被真实文章替换。',
    date: '2026-09-01',
    tags: ['数据闭环', '车端'],
    contentHtml: `
      <p>这是本地占位内容。当你在 Notion 建好 <code>Published Blog</code> 数据库，并配置 <code>NOTION_TOKEN</code> 与 <code>NOTION_DATABASE_ID</code> 后，构建时会拉取已发布文章。</p>
      <p>建议属性：Title、Slug、Status、Date、Summary、Tags、Cover。</p>
    `,
  },
  {
    id: 'placeholder-2',
    title: '联调笔记：弱网回传与本地缓存',
    slug: 'weak-network-upload-notes',
    summary: '占位文章：用于预览列表与详情页版式。',
    date: '2026-08-12',
    tags: ['回传', '联调'],
    contentHtml: `
      <p>后续把愿意公开的 Notion 笔记移入发布库即可出现在这里。</p>
    `,
  },
]

function plainText(richText: NotionRichText[] | undefined): string {
  return (richText || []).map((item) => item.plain_text).join('')
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(input: string): string {
  return escapeHtml(input).replace(/"/g, '&quot;')
}

function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80)

  return slug || 'post'
}

function getProp(page: NotionPage, names: readonly string[]) {
  for (const name of names) {
    if (page.properties[name]) return page.properties[name]
  }
  return undefined
}

function readTitle(page: NotionPage): string {
  const prop = getProp(page, PROPERTY_ALIASES.title)
  if (prop?.type === 'title') return plainText(prop.title)
  if (prop?.type === 'rich_text') return plainText(prop.rich_text)
  return ''
}

/** 没有状态属性（或类型无法识别）时视为已发布。 */
function readStatus(page: NotionPage): string {
  const prop = getProp(page, PROPERTY_ALIASES.status)
  if (prop?.type === 'select') return prop.select?.name || ''
  if (prop?.type === 'status') return prop.status?.name || ''
  return 'Published'
}

function readSlug(page: NotionPage): string {
  const prop = getProp(page, PROPERTY_ALIASES.slug)
  if (prop?.type === 'rich_text') return plainText(prop.rich_text)
  if (prop?.type === 'url') return prop.url || ''
  return ''
}

function readSummary(page: NotionPage): string {
  const prop = getProp(page, PROPERTY_ALIASES.summary)
  return prop?.type === 'rich_text' ? plainText(prop.rich_text) : ''
}

function readDate(page: NotionPage): string {
  const prop = getProp(page, PROPERTY_ALIASES.date)
  if (prop?.type === 'date') return prop.date?.start || ''
  return new Date().toISOString().slice(0, 10)
}

function readTags(page: NotionPage): string[] {
  const prop = getProp(page, PROPERTY_ALIASES.tags)
  if (prop?.type !== 'multi_select') return []
  return prop.multi_select.map((tag: { name: string }) => tag.name)
}

function readCover(page: NotionPage): string | undefined {
  if (page.cover?.type === 'external') return page.cover.external?.url
  if (page.cover?.type === 'file') return page.cover.file?.url
  return undefined
}

function mapPageMeta(page: NotionPage): BlogPostMeta | null {
  const title = readTitle(page)
  if (!title) return null

  const status = readStatus(page)
  if (status && !PUBLISHED_STATUS_PATTERN.test(status)) return null

  return {
    id: page.id,
    title,
    slug: readSlug(page) || slugify(title),
    summary: readSummary(page),
    date: readDate(page),
    tags: readTags(page),
    cover: readCover(page),
  }
}

function renderImage(data: any): string | null {
  const url = data?.type === 'external' ? data.external?.url : data?.file?.url
  if (!url) return null

  const caption = plainText(data?.caption)
  return `<figure><img src="${escapeAttr(url)}" alt="${escapeAttr(caption)}" /><figcaption>${escapeHtml(caption)}</figcaption></figure>`
}

function renderBlock(block: any): string | null {
  const type = block.type as string
  const data = block[type]
  const text = escapeHtml(plainText(data?.rich_text))

  switch (type) {
    case 'paragraph':
      return `<p>${text}</p>`
    case 'heading_1':
      return `<h1>${text}</h1>`
    case 'heading_2':
      return `<h2>${text}</h2>`
    case 'heading_3':
      return `<h3>${text}</h3>`
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return `<li>${text}</li>`
    case 'quote':
      return `<blockquote><p>${text}</p></blockquote>`
    case 'code':
      return `<pre><code>${text}</code></pre>`
    case 'divider':
      return '<hr />'
    case 'image':
      return renderImage(data)
    default:
      return text ? `<p>${text}</p>` : null
  }
}

function wrapLists(html: string): string {
  return html.replace(
    /(?:<li>[\s\S]*?<\/li>\n?)+/g,
    (match) => `<ul>${match}</ul>`,
  )
}

async function blocksToHtml(client: Client, blockId: string): Promise<string> {
  const chunks: string[] = []
  let cursor: string | undefined

  do {
    const res = await client.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })

    for (const block of res.results) {
      if (!('type' in block)) continue
      const html = renderBlock(block)
      if (html !== null) chunks.push(html)
    }

    cursor = res.has_more ? res.next_cursor || undefined : undefined
  } while (cursor)

  return wrapLists(chunks.join('\n'))
}

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const { notionToken, notionDatabaseId } = useRuntimeConfig()

  if (!notionToken || !notionDatabaseId) {
    return PLACEHOLDER_POSTS
  }

  const client = new Client({ auth: notionToken })

  const queried = await client.databases
    .query({
      database_id: notionDatabaseId,
      sorts: [{ property: 'Date', direction: 'descending' }],
    })
    // Date 属性名可能不同，退回无排序查询
    .catch(() => client.databases.query({ database_id: notionDatabaseId }))

  const metas: BlogPostMeta[] = []
  for (const result of queried.results) {
    if (!('properties' in result)) continue
    const meta = mapPageMeta(result as NotionPage)
    if (meta) metas.push(meta)
  }

  metas.sort((a, b) => (a.date < b.date ? 1 : -1))

  const posts: BlogPost[] = []
  for (const meta of metas) {
    const contentHtml = await blocksToHtml(client, meta.id)
    posts.push({ ...meta, contentHtml })
  }

  return posts.length ? posts : PLACEHOLDER_POSTS
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchPublishedPosts()
  return posts.find((post) => post.slug === slug) || null
}

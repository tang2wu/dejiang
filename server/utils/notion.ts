import { Client } from '@notionhq/client'
import type { BlogPost, BlogPostMeta } from '~/data/site'

type NotionRichText = {
  plain_text: string
}

type NotionPage = {
  id: string
  properties: Record<string, any>
  cover?: {
    type: string
    external?: { url: string }
    file?: { url: string }
  } | null
}

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

function plainText(rich: NotionRichText[] | undefined): string {
  return (rich || []).map((t) => t.plain_text).join('')
}

function getProp(page: NotionPage, names: string[]) {
  for (const name of names) {
    if (page.properties[name]) return page.properties[name]
  }
  return undefined
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'post'
}

function mapPageMeta(page: NotionPage): BlogPostMeta | null {
  const titleProp = getProp(page, ['Title', 'Name', '标题', '名称'])
  const title =
    titleProp?.type === 'title'
      ? plainText(titleProp.title)
      : titleProp?.type === 'rich_text'
        ? plainText(titleProp.rich_text)
        : ''

  if (!title) return null

  const statusProp = getProp(page, ['Status', '状态'])
  const status =
    statusProp?.type === 'select'
      ? statusProp.select?.name || ''
      : statusProp?.type === 'status'
        ? statusProp.status?.name || ''
        : 'Published'

  if (status && !/published|发布|公开/i.test(status)) {
    return null
  }

  const slugProp = getProp(page, ['Slug', 'slug', '路径'])
  const slugRaw =
    slugProp?.type === 'rich_text'
      ? plainText(slugProp.rich_text)
      : slugProp?.type === 'url'
        ? slugProp.url || ''
        : ''
  const slug = slugRaw || slugify(title)

  const summaryProp = getProp(page, ['Summary', '摘要', 'Description', '描述'])
  const summary =
    summaryProp?.type === 'rich_text'
      ? plainText(summaryProp.rich_text)
      : ''

  const dateProp = getProp(page, ['Date', '日期', 'Published', '发布日期'])
  const date =
    dateProp?.type === 'date'
      ? dateProp.date?.start || ''
      : new Date().toISOString().slice(0, 10)

  const tagsProp = getProp(page, ['Tags', '标签', 'Tag'])
  const tags =
    tagsProp?.type === 'multi_select'
      ? tagsProp.multi_select.map((t: { name: string }) => t.name)
      : []

  let cover: string | undefined
  if (page.cover?.type === 'external') cover = page.cover.external?.url
  if (page.cover?.type === 'file') cover = page.cover.file?.url

  return {
    id: page.id,
    title,
    slug,
    summary,
    date,
    tags,
    cover,
  }
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

    for (const block of res.results as any[]) {
      if (!('type' in block)) continue
      const type = block.type as string
      const data = block[type]
      const text = plainText(data?.rich_text)

      switch (type) {
        case 'paragraph':
          chunks.push(`<p>${escapeHtml(text)}</p>`)
          break
        case 'heading_1':
          chunks.push(`<h1>${escapeHtml(text)}</h1>`)
          break
        case 'heading_2':
          chunks.push(`<h2>${escapeHtml(text)}</h2>`)
          break
        case 'heading_3':
          chunks.push(`<h3>${escapeHtml(text)}</h3>`)
          break
        case 'bulleted_list_item':
          chunks.push(`<li>${escapeHtml(text)}</li>`)
          break
        case 'numbered_list_item':
          chunks.push(`<li>${escapeHtml(text)}</li>`)
          break
        case 'quote':
          chunks.push(`<blockquote><p>${escapeHtml(text)}</p></blockquote>`)
          break
        case 'code':
          chunks.push(
            `<pre><code>${escapeHtml(plainText(data?.rich_text))}</code></pre>`,
          )
          break
        case 'divider':
          chunks.push('<hr />')
          break
        case 'image': {
          const url =
            data?.type === 'external'
              ? data.external?.url
              : data?.file?.url
          const caption = plainText(data?.caption)
          if (url) {
            chunks.push(
              `<figure><img src="${escapeAttr(url)}" alt="${escapeAttr(caption || '')}" /><figcaption>${escapeHtml(caption)}</figcaption></figure>`,
            )
          }
          break
        }
        default:
          if (text) chunks.push(`<p>${escapeHtml(text)}</p>`)
      }
    }

    cursor = res.has_more ? res.next_cursor || undefined : undefined
  } while (cursor)

  return wrapLists(chunks.join('\n'))
}

function wrapLists(html: string): string {
  return html
    .replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
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

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const config = useRuntimeConfig()
  const token = config.notionToken
  const databaseId = config.notionDatabaseId

  if (!token || !databaseId) {
    return PLACEHOLDER_POSTS
  }

  const client = new Client({ auth: token })

  const queried = await client.databases.query({
    database_id: databaseId,
    sorts: [{ property: 'Date', direction: 'descending' }],
  }).catch(async () => {
    // Date 属性名可能不同，退回无排序查询
    return client.databases.query({ database_id: databaseId })
  })

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
  return posts.find((p) => p.slug === slug) || null
}

export async function listPostSlugs(): Promise<string[]> {
  const posts = await fetchPublishedPosts()
  return posts.map((p) => p.slug)
}

import type { BlogPostMeta } from '~/types/blog'

export default defineEventHandler(async (): Promise<BlogPostMeta[]> => {
  const posts = await fetchPublishedPosts()
  return posts.map(({ contentHtml: _contentHtml, ...meta }) => meta)
})

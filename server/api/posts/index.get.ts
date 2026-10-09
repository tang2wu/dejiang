export default defineEventHandler(async () => {
  const posts = await fetchPublishedPosts()
  return posts.map(({ contentHtml, ...meta }) => meta)
})

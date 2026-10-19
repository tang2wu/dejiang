export interface BlogPostMeta {
  id: string
  title: string
  slug: string
  summary: string
  date: string
  tags: string[]
  cover?: string
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string
}

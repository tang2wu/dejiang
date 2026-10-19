// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '汤德江 · 数据闭环开发工程师',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            '汤德江 — 数据闭环开发工程师（偏车端），现居上海。项目经历、技术笔记与联系方式。',
        },
        { name: 'author', content: '汤德江' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '汤德江 · 数据闭环开发工程师' },
        {
          property: 'og:description',
          content: '数据闭环开发工程师（偏车端）个人主页 · 上海',
        },
        { name: 'twitter:card', content: 'summary' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;700&family=Outfit:wght@500;600;700&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    notionToken: process.env.NOTION_TOKEN || '',
    notionDatabaseId: process.env.NOTION_DATABASE_ID || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.pages.dev',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // 文章详情页由 crawlLinks 从 /blog 列表自动发现，无需逐条列出
      routes: ['/', '/blog'],
    },
  },
})

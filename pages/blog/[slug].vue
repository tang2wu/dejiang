<script setup lang="ts">
import { site } from '~/data/site'
import type { BlogPost } from '~/types/blog'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { data: post, error } = await useFetch<BlogPost>(
  () => `/api/posts/${slug.value}`,
)

if (error.value || !post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '文章不存在',
  })
}

useSeoMeta({
  title: () => `${post.value?.title || '文章'} · ${site.name}`,
  description: () => post.value?.summary || post.value?.title,
})
</script>

<template>
  <article v-if="post" class="article container">
    <NuxtLink class="back-link" to="/blog">← 返回笔记列表</NuxtLink>
    <div class="article__meta">
      <time :datetime="post.date">{{ post.date }}</time>
      <span v-if="post.tags.length"> · {{ post.tags.join(' / ') }}</span>
    </div>
    <h1 class="article__title">{{ post.title }}</h1>
    <div class="article__body" v-html="post.contentHtml" />
  </article>
</template>

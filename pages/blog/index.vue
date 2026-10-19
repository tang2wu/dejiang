<script setup lang="ts">
import { site } from '~/data/site'
import type { BlogPostMeta } from '~/types/blog'

const { data: posts, error } = await useFetch<BlogPostMeta[]>('/api/posts', {
  default: () => [],
})

useSeoMeta({
  title: `技术笔记 · ${site.name}`,
  description: '从 Notion 同步的可公开技术笔记与工作记录。',
})
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="section__head">
        <p class="section__eyebrow">Notes</p>
        <h1 class="section__title">技术笔记</h1>
        <p class="section__desc">
          文章在 Notion 的 Published Blog 中维护，构建时同步到本站。
        </p>
      </div>

      <p v-if="error" class="blog-empty">
        暂时无法加载文章列表。请稍后重试，或检查 Notion 环境变量。
      </p>

      <div v-else-if="posts?.length" class="blog-list">
        <NuxtLink
          v-for="post in posts"
          :key="post.id"
          class="blog-item"
          :to="`/blog/${post.slug}`"
        >
          <span class="blog-item__date">{{ post.date }}</span>
          <h2 class="blog-item__title">{{ post.title }}</h2>
          <p v-if="post.summary" class="blog-item__summary">
            {{ post.summary }}
          </p>
        </NuxtLink>
      </div>

      <p v-else class="blog-empty">
        还没有已发布文章。配置 Notion 后重新构建即可出现。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { site } from '~/data/site'
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <NuxtLink class="brand" to="/">
        {{ site.name }}<span>.</span>
      </NuxtLink>
      <nav class="nav" aria-label="主导航">
        <a href="/#about">关于</a>
        <a href="/#experience">经历</a>
        <a href="/#projects">项目</a>
        <NuxtLink to="/blog">笔记</NuxtLink>
        <a href="/#contact">联系</a>
      </nav>
    </div>
  </header>
</template>

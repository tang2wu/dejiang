<script setup lang="ts">
import { site } from '~/data/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <span>© {{ year }} {{ site.name }} · {{ site.city }}</span>
      <span>内容以可公开信息为准 · 文章同步自 Notion</span>
    </div>
  </footer>
</template>

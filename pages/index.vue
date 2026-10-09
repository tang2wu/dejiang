<script setup lang="ts">
import { site } from '~/data/site'

useSeoMeta({
  title: `${site.name} · ${site.title}`,
  description: `${site.name} — ${site.title}，现居${site.city}。项目经历、技术笔记与联系方式。`,
  ogTitle: `${site.name} · ${site.title}`,
  ogDescription: site.tagline,
})
</script>

<template>
  <div>
    <section class="hero container">
      <p class="hero__kicker">{{ site.city }} · Portfolio</p>
      <h1 class="hero__name">{{ site.name }}</h1>
      <p class="hero__title">{{ site.title }}</p>
      <p class="hero__tagline">{{ site.tagline }}</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#projects">查看项目</a>
        <a class="btn btn--ghost" href="#contact">联系我</a>
        <NuxtLink class="btn btn--ghost" to="/blog">技术笔记</NuxtLink>
      </div>
    </section>

    <section id="about" class="section">
      <div class="container">
        <div class="section__head">
          <p class="section__eyebrow">About</p>
          <h2 class="section__title">关于我</h2>
        </div>
        <div class="about-grid">
          <div class="prose">
            <p v-for="(paragraph, i) in site.about" :key="i">
              {{ paragraph }}
            </p>
          </div>
          <div>
            <p class="section__eyebrow">Skills</p>
            <ul class="skill-list">
              <li v-for="skill in site.skills" :key="skill">{{ skill }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section id="experience" class="section">
      <div class="container">
        <div class="section__head">
          <p class="section__eyebrow">Experience</p>
          <h2 class="section__title">经历</h2>
          <p class="section__desc">
            以下为可公开摘要，详细履历欢迎邮件索取。
          </p>
        </div>
        <div class="timeline">
          <article
            v-for="(item, i) in site.experience"
            :key="i"
            class="timeline__item"
          >
            <div class="timeline__meta">
              <span>{{ item.period }}</span>
              <span>{{ item.location }}</span>
            </div>
            <h3 class="timeline__company">{{ item.company }}</h3>
            <p class="timeline__role">{{ item.title }}</p>
            <ul>
              <li v-for="(point, j) in item.highlights" :key="j">
                {{ point }}
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section id="projects" class="section">
      <div class="container">
        <div class="section__head">
          <p class="section__eyebrow">Projects</p>
          <h2 class="section__title">项目</h2>
          <p class="section__desc">
            先用方向性占位，便于你后续替换成真实案例与量化结果。
          </p>
        </div>
        <div class="project-list">
          <article
            v-for="project in site.projects"
            :key="project.name"
            class="project"
          >
            <h3 class="project__name">{{ project.name }}</h3>
            <p class="project__role">{{ project.role }}</p>
            <p class="project__summary">{{ project.summary }}</p>
            <p v-if="project.outcome" class="project__outcome">
              {{ project.outcome }}
            </p>
            <ul class="project__tags">
              <li v-for="tag in project.tags" :key="tag">#{{ tag }}</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section id="contact" class="section">
      <div class="container">
        <div class="section__head">
          <p class="section__eyebrow">Contact</p>
          <h2 class="section__title">联系</h2>
        </div>
        <div class="contact-box">
          <a :href="`mailto:${site.email}`">{{ site.email }}</a>
          <p>{{ site.contactNote }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

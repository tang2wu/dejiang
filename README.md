# 汤德江 · 个人主页

求职向个人站（Nuxt 3 + Vue）：首页介绍 / 经历 / 项目 / 联系；博客从 Notion `Published Blog` 构建时同步。

## 本地开发

```bash
cp .env.example .env
npm install
npm run dev
```

未配置 Notion 时，`/blog` 会显示两篇占位文章，方便先调版式。

## Notion 接入

1. 在 Notion 新建数据库 **Published Blog**
2. 建议属性：
   - `Title`（title）
   - `Slug`（rich text，可选；为空则按标题生成）
   - `Status`（select / status：`Published` 才上线）
   - `Date`（date）
   - `Summary`（rich text）
   - `Tags`（multi-select）
   - `Cover`（页面封面，可选）
3. 创建 [Internal Integration](https://www.notion.so/my-integrations)，把数据库 Share 给该集成
4. 把 `NOTION_TOKEN`、`NOTION_DATABASE_ID` 写入本地 `.env`，以及 Cloudflare Pages 环境变量
5. 重新 `npm run generate` 或触发 Pages 构建

约 30 篇文章的体量完全适合构建时拉取。

## 部署（Cloudflare Pages → 免费 `xxx.pages.dev`）

当前推荐先用平台免费域名，例如 `https://tangdejiang.pages.dev`（项目名可自定）。

### A. 推荐：GitHub 连接（以后改代码自动更新）

1. 把本仓库推到 GitHub（公开或私有均可）
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权并选中仓库，构建设置如下：

| 项 | 值 |
|----|-----|
| Framework preset | Nuxt.js 或 None |
| Build command | `npm run generate` |
| Build output directory | `.output/public` |
| Root directory | `/`（默认） |

4. **Environment variables**（Production）增加：
   - `NODE_VERSION` = `22`
   - （可选）`NOTION_TOKEN`、`NOTION_DATABASE_ID`
5. **Save and Deploy** → 完成后即可得到 `https://<项目名>.pages.dev`

### B. 本机直接上传（不先建 GitHub 也能试）

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd /home/hirain/Blog
npm run generate
npx wrangler pages deploy .output/public --project-name=tangdejiang
```

首次会打开浏览器登录 Cloudflare；成功后同样得到 `https://tangdejiang.pages.dev`。  
若项目名已被占用，改 `--project-name` 即可（网址跟着变）。

## 内容修改位置

| 内容 | 文件 |
|------|------|
| 姓名、定位、经历、项目、技能 | `data/site.ts` |
| 视觉与排版 | `assets/css/main.css` |
| Notion 拉取逻辑 | `server/utils/notion.ts` |

## 已知限制

- Notion 图片链接约 1 小时过期；后续可在构建时下载到 `public/`（当前版本先直链，适合少图文章）
- 部分 Notion 块（嵌入、数据库视图等）会简化或跳过
- 改 Notion 后需重新部署才会更新站点

export interface SiteProject {
  name: string
  role: string
  summary: string
  tags: string[]
  outcome?: string
}

export interface SiteExperience {
  company: string
  title: string
  period: string
  location: string
  highlights: string[]
}

export const site = {
  name: '汤德江',
  nameEn: 'Tang Dejiang',
  title: '数据闭环开发工程师（偏车端）',
  city: '上海',
  email: 'tangdejiang01@gmail.com',
  tagline:
    '把车端采集、回传与闭环链路做稳，让数据真正驱动迭代。',
  about: [
    '我是汤德江，数据闭环开发工程师，工作重心在车端侧：采集、传输、存储与闭环流程的落地与打磨。',
    '面向招聘方，这里汇总我的经历、项目与可公开的技术笔记；文章来自 Notion，偶尔更新。',
  ],
  skills: [
    '数据闭环 / 车端采集',
    '嵌入式与车载系统协作',
    '链路监控与问题定位',
    'Python / Shell',
    'Linux 工具链',
    'Vue / 前端工程化',
  ],
  experience: [
    {
      company: '待补充',
      title: '数据闭环开发工程师（偏车端）',
      period: '近期',
      location: '上海',
      highlights: [
        '参与车端数据采集与回传相关开发与联调',
        '关注闭环链路稳定性、可观测性与问题闭环',
        '与算法、平台、测试协作推进数据可用性',
      ],
    },
  ] satisfies SiteExperience[],
  projects: [
    {
      name: '车端采集与回传链路',
      role: '开发 / 联调',
      summary:
        '围绕车端数据采集、本地缓存与回传策略，提升链路在弱网与异常场景下的稳定性。',
      tags: ['车端', '采集', '回传'],
      outcome: '占位：补充量化结果（成功率、延迟、覆盖车型等）',
    },
    {
      name: '数据闭环问题定位',
      role: '开发 / 排查',
      summary:
        '梳理采集—上传—入库—标注/训练反馈路径中的断点，建立可复现的排查路径。',
      tags: ['闭环', '可观测性'],
      outcome: '占位：补充典型案例与改进项',
    },
    {
      name: '工具与自动化',
      role: '开发',
      summary:
        '用脚本与小工具缩短联调、日志分析与回归验证成本。',
      tags: ['自动化', '工程效率'],
      outcome: '占位：补充具体工具名与收益',
    },
  ] satisfies SiteProject[],
  contactNote: '欢迎邮件联系；若需微信或简历 PDF，可在邮件中说明。',
} as const

export type BlogPostMeta = {
  id: string
  title: string
  slug: string
  summary: string
  date: string
  tags: string[]
  cover?: string
}

export type BlogPost = BlogPostMeta & {
  contentHtml: string
}

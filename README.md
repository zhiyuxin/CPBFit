# WeightTrack 🏋️ 优雅的体重管理工具

> 一个 Apple Health 风格的全功能体重管理 Web 应用，手机浏览器打开即可使用，支持添加到桌面像原生 App 一样运行。

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📱 功能一览

| 页面 | 功能 |
|------|------|
| 🏠 **今日** | 体重录入（±微调）、目标进度环、BMI 计算与分类、饮水打卡、体重趋势图（7/14/30/90天 + 7日均线） |
| 🍽️ **饮食** | 190种中餐食物数据库搜索、克数输入自动算热量、分餐记录（早/中/晚/加餐）、热量预算进度条、营养素概览 |
| 🤖 **AI 顾问** | DeepSeek 驱动的 AI 饮食顾问，问答食物能否吃、热量分析、替代推荐，打字机流式输出 |
| 📋 **历史** | 体重记录列表、行内编辑/删除、删除确认弹窗 |
| 📊 **统计** | 总变化、周均变化率、最低/最高体重、最佳/最差周、距目标天数预估、周平均值列表 |
| 📏 **围度** | 腰围/臀围/臂围/大腿围记录与历史 |
| ⚙️ **设置** | 个人资料（昵称/身高/目标/起始体重）、每日热量预算、推送通知配置、账户退出 |
| 🔔 **通知** | 自定义推送通知（时间/内容/重复次数），定时提醒记录体重 |

## 🎨 设计风格

- Apple Health 风格 — 毛玻璃卡片、圆角、柔和阴影
- 移动端优先 — 底部 5-Tab 导航、全面屏适配（safe-area-inset）
- 深色模式支持
- 页面进入动画（fadeSlideUp）、骨架屏加载、按压反馈动效

## 🏗️ 技术架构

```
┌──────────────────────────────────────┐
│            Next.js 16 (App Router)    │
│  ┌──────────┬──────────┬──────────┐  │
│  │  React 19 │ Tailwind 4 │ Recharts │  │
│  │  Lucide   │   CSS      │ 图表     │  │
│  └──────────┴──────────┴──────────┘  │
│  ┌──────────────────────────────────┐ │
│  │     Prisma 7 + SQLite (本地)      │ │
│  │     / PostgreSQL (Vercel 部署)    │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │  NextAuth v5 (邮箱+密码登录)     │ │
│  │  DeepSeek API (AI 饮食顾问)       │ │
│  └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
# 1. 进入项目目录
cd weight-track

# 2. 安装依赖
npm install

# 3. 初始化数据库（含 190 种食物数据）
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# 4. 启动开发服务器
npm run dev

# 5. 浏览器打开
open http://localhost:3000
```

### 配置环境变量

复制 `.env` 文件（已预置本地开发配置），如需 AI 功能需配置 DeepSeek API Key：

```env
# .env 文件中的关键配置
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="<运行 openssl rand -base64 32 生成>"
NEXTAUTH_URL="http://localhost:3000"
DEEPSEEK_API_KEY="sk-your-deepseek-api-key-here"   # 从 https://platform.deepseek.com 获取
```

## 🔧 配置指南

### AI 饮食顾问

1. 前往 [DeepSeek Platform](https://platform.deepseek.com) 注册账号
2. 进入 API Keys 页面，创建新的 API Key
3. 将 Key 填入 `.env` 文件的 `DEEPSEEK_API_KEY` 字段
4. 重启开发服务器即可使用底部导航「AI」功能

### 推送通知

1. 登录后进入「设置」页面
2. 点击「授权通知」允许浏览器通知权限
3. 点击「添加通知」设置提醒时间和内容
4. 支持自定义文案或使用预设模板，可设置重复次数（1/3/7/30/无限次）

### 多人登录

系统内置 NextAuth 邮箱+密码登录，每人数据完全隔离：

| 操作 | 说明 |
|------|------|
| 注册 | 打开页面 → 点击「注册」→ 填写昵称/邮箱/密码 |
| 登录 | 输入邮箱和密码 |
| 退出 | 设置页 → 「退出登录」按钮 |

**管理员测试账号：** `admin@weight.com` / `admin123`

## 📦 部署到 VPS

一键部署脚本：

```bash
# SSH 到服务器后运行
git clone https://gitee.com/luodm/cpbfit.git /tmp/cpbfit
cd /tmp/cpbfit/weight-track
bash deploy.sh
```

详见 [DEPLOY.md](DEPLOY.md) — 包含一键部署脚本、手动部署步骤、Nginx 配置、HTTPS、日常运维等完整指南。

## 📦 部署到 Vercel

```bash
# 推送代码到 Git
git push origin master

# 在 Vercel 导入项目，需配置：
# 1. Storage → Create Database → Vercel Postgres
# 2. 环境变量：NEXTAUTH_SECRET, NEXTAUTH_URL, DEEPSEEK_API_KEY
# 3. 构建命令使用 scripts/vercel-build.sh（自动切换 PostgreSQL schema）
```

## 📁 项目结构

```
weight-track/
├── prisma/                    # 数据库
│   ├── schema.prisma          # SQLite 数据库模型
│   ├── schema.pg.prisma       # PostgreSQL 数据库模型（Vercel）
│   └── seed.ts                # 食物数据导入脚本
├── public/                    # 静态资源
│   ├── manifest.json          # PWA 配置
│   └── icon-192.svg           # 应用图标
├── src/
│   ├── app/                   # Next.js App Router 页面
│   │   ├── page.tsx           # 首页 - 今日
│   │   ├── layout.tsx         # 根布局
│   │   ├── login/             # 登录/注册页
│   │   ├── diet/              # 饮食记录页
│   │   ├── advisor/           # AI 饮食顾问页
│   │   ├── history/           # 历史记录页
│   │   ├── stats/             # 统计页
│   │   ├── measurements/      # 围度记录页
│   │   ├── settings/          # 设置页
│   │   └── api/               # API 路由
│   │       ├── auth/          # 登录注册
│   │       ├── records/       # 体重记录
│   │       ├── profile/       # 个人资料
│   │       ├── water/         # 饮水记录
│   │       ├── foods/         # 食物搜索
│   │       ├── meals/         # 用餐记录
│   │       ├── measurements/  # 围度记录
│   │       ├── notifications/ # 推送通知
│   │       └── ai/            # AI 饮食顾问
│   ├── components/            # 公共组件
│   │   ├── BottomNav.tsx      # 底部导航
│   │   ├── GlassCard.tsx      # 毛玻璃卡片
│   │   ├── ProgressRing.tsx   # 进度环
│   │   ├── WeightInput.tsx    # 体重输入
│   │   ├── WeightChart.tsx    # 体重图表
│   │   ├── AuthProvider.tsx   # 登录状态
│   │   └── NotificationSettings.tsx  # 通知配置
│   ├── data/
│   │   └── foods.ts           # 190 种食物数据库
│   ├── hooks/
│   │   └── useNotificationScheduler.ts  # 通知定时器
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── auth.ts            # NextAuth 配置
│   │   └── utils.ts           # 工具函数
│   └── proxy.ts               # 路由守卫中间件
├── scripts/
│   └── vercel-build.sh        # Vercel 构建脚本
└── package.json
```

## 📊 食物数据库

内置 190 种常见中餐食物，覆盖 11 大类：

| 分类 | 数量 | 示例 |
|------|------|------|
| 🍚 主食 | 20 | 米饭、面条、馒头、红薯、玉米 |
| 🥩 肉类 | 16 | 鸡胸肉、牛肉、猪瘦肉、鸡翅 |
| 🐟 水产 | 11 | 虾仁、三文鱼、鲈鱼、蛤蜊 |
| 🥬 蔬菜 | 28 | 白菜、菠菜、西兰花、番茄 |
| 🫘 豆制品 | 8 | 豆腐、豆浆、腐竹 |
| 🍎 水果 | 21 | 苹果、香蕉、草莓、牛油果 |
| 🥛 奶制品 | 8 | 牛奶、酸奶、奶酪 |
| 🥚 蛋类 | 6 | 鸡蛋、鸭蛋、皮蛋 |
| 🍪 零食 | 14 | 薯片、巧克力、坚果、辣条 |
| 🥤 饮料 | 8 | 可乐、奶茶、啤酒、拿铁 |
| 🥘 中式菜品 | 30 | 番茄炒蛋、宫保鸡丁、红烧肉 |
| 🥣 汤类 | 8 | 紫菜蛋花汤、冬瓜排骨汤 |

## 🧪 技术亮点

- **SSR + API Routes** — Next.js App Router，前后端一体化
- **Prisma 7** — 类型安全的 ORM，支持 SQLite/PostgreSQL 双模式
- **NextAuth v5** — JWT 会话管理，多用户数据隔离
- **Streaming AI** — DeepSeek API 流式输出，打字机效果
- **PWA** — manifest.json + display=standalone，可安装到桌面
- **Notification API** — 浏览器推送通知，定时检查触发
- **Recharts** — 交互式体重趋势图 + 移动平均线
- **Tailwind CSS 4** — 原子化 CSS，Apple Health 风格设计系统

## 📄 License

MIT

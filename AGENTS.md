# WeightTrack 项目技术文档

## 项目概述

WeightTrack 是一个 Apple Health 风格的体重管理 Web 应用，提供体重追踪、饮食记录、AI 饮食顾问、推送通知等完整功能。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | 框架 (App Router) |
| React | 19 | UI 库 |
| TypeScript | 5 | 类型安全 |
| Tailwind CSS | 4 | 样式 |
| Prisma | 7 | ORM |
| NextAuth | 5 (beta) | 登录认证 |
| Recharts | 2 | 图表 |
| Lucide React | 0.5 | 图标 |
| DeepSeek API | - | AI 饮食顾问 |
| bcryptjs | 2.4 | 密码加密 |
| better-sqlite3 | 11 | SQLite 驱动 |

## 运行命令

```bash
# 开发服务器 (默认 :3000)
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# TypeScript 检查
npx tsc --noEmit

# 数据库迁移
npx prisma migrate dev --name <migration-name>

# 生成 Prisma Client
npx prisma generate

# 导入食物数据
npx tsx prisma/seed.ts

# Prisma Studio (数据库可视化)
npx prisma studio

# 数据库重置
npx prisma migrate reset --force
```

## 项目架构

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局（AuthProvider + NotificationProvider + BottomNav）
│   ├── page.tsx                  # 首页：今日体重/目标/BMI/趋势图
│   ├── proxy.ts                  # 路由守卫（未登录跳转 /login）
│   ├── login/page.tsx            # 登录/注册
│   ├── diet/page.tsx             # 饮食记录 + 热量预算
│   ├── advisor/page.tsx          # AI 饮食顾问（流式聊天）
│   ├── history/page.tsx          # 历史记录列表
│   ├── stats/page.tsx            # 统计数据
│   ├── measurements/page.tsx     # 身体围度
│   ├── settings/page.tsx         # 设置页
│   └── api/                      # API Routes
│       ├── auth/                 # NextAuth + 注册
│       ├── records/              # 体重 CRUD
│       ├── profile/              # 个人资料 CRUD
│       ├── water/                # 饮水 CRUD
│       ├── foods/                # 食物搜索 API
│       ├── meals/                # 用餐记录 CRUD
│       ├── measurements/         # 围度 CRUD
│       ├── notifications/        # 通知 CRUD
│       └── ai/                   # DeepSeek 流式 API
├── components/                   # 共享组件
│   ├── AuthProvider.tsx          # SessionProvider 封装
│   ├── BottomNav.tsx             # 底部导航栏
│   ├── GlassCard.tsx             # 毛玻璃卡片
│   ├── NotificationProvider.tsx   # 通知调度器
│   ├── NotificationSettings.tsx  # 通知配置面板
│   ├── ProgressRing.tsx          # SVG 进度环
│   ├── WeightChart.tsx           # 体重趋势图（Recharts）
│   └── WeightInput.tsx           # 体重录入表单
├── data/
│   └── foods.ts                  # 190 种食物数据库（静态数据）
├── hooks/
│   └── useNotificationScheduler.ts  # 通知定时扫描
└── lib/
    ├── auth.ts                   # NextAuth 配置（Credentials Provider）
    ├── prisma.ts                 # Prisma 客户端（自动适配 SQLite/PostgreSQL）
    └── utils.ts                  # 工具函数（BMI/日期/移动平均）
```

## 数据模型

### User
- `id` String @id @cuid
- `name` String
- `email` String @unique
- `hashedPassword` String
- 关联: Profile, WeightRecord[], BodyMeasurement[], WaterRecord[], MealRecord[], NotificationSetting[]

### Profile (1:1 with User)
- `userId` String @unique
- `heightCm`, `goalKg`, `startKg`, `calorieBudget` Float?

### WeightRecord (1:N with User)
- `userId` + `date` @unique
- `weightKg` Float, `note` String?

### MealRecord (1:N with User, N:1 with FoodItem)
- `userId` + `date` (index)
- `mealType` String (breakfast/lunch/dinner/snack)
- `foodId` → FoodItem, `grams` Float, `calories` Float

### FoodItem
- `name`, `category`, `calories`, `protein?`, `fat?`, `carbs?`
- `unit?` @default("份"), `unitGrams?` @default(100)

### NotificationSetting (1:N with User)
- `hour` Int, `minute` Int
- `title`, `body` String
- `repeatCount` Int (0=无限)
- `enabled` Boolean

### BodyMeasurement / WaterRecord / ProgressPhoto
- 均通过 `userId` 关联 User，`userId+date` 唯一

## API 路由

| 路由 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | 否 | NextAuth 认证端点 |
| `/api/auth/register` | POST | 否 | 注册新用户 |
| `/api/records` | GET/POST/DELETE | 是 | 体重记录 CRUD |
| `/api/profile` | GET/PUT | 是 | 个人资料 |
| `/api/water` | GET/POST | 是 | 饮水记录 |
| `/api/measurements` | GET/POST | 是 | 围度记录 |
| `/api/foods` | GET/POST | 是 | 食物搜索/创建 |
| `/api/meals` | GET/POST/DELETE | 是 | 用餐记录 |
| `/api/notifications` | GET/POST/PUT/DELETE | 是 | 通知设置 |
| `/api/ai` | POST | 是 | AI 饮食顾问（流式） |

## 认证机制

- **Provider**: NextAuth v5 Credentials (邮箱+密码)
- **Session 策略**: JWT（30 天过期）
- **密码加密**: bcryptjs (12 轮)
- **路由保护**: proxy.ts 检查 `authjs.session-token` cookie
- **数据隔离**: 所有 API 通过 `auth()` 获取 userId，按 userId 过滤数据

## 设计系统 (CSS)

- CSS 变量驱动的主题 (Apple Health 配色)
- `.glass-card` — 毛玻璃卡片 + 按压缩放反馈
- `.btn-press` — 按钮按下动效 (scale 0.95)
- `.skeleton` — 骨架屏闪烁
- `.page-enter / .page-enter-d[1-4]` — 页面进入动画 (fadeSlideUp + 延迟)
- `safe-bottom / safe-top` — 全面屏安全区域

## 关键实现细节

### AI 流式输出
1. 前端发送 POST 到 `/api/ai`，携带用户消息和最近 10 条历史
2. 后端调用 DeepSeek API (`stream: true`)
3. 解析 SSE `data:` 行，通过 ReadableStream 逐 chunk 转发
4. 前端用 ReadableStream reader 逐块读取，实时更新 UI

### 推送通知
1. 设置页配置通知时间/内容/重复次数，存入数据库
2. `useNotificationScheduler` hook 每 30 秒轮询
3. 命中设定时间时调用 `new Notification()` 推送
4. 自动递减剩余次数，归零后禁用

### 双数据库支持
- 本地开发: `schema.prisma` + SQLite (`better-sqlite3` adapter)
- Vercel 部署: `schema.pg.prisma` + PostgreSQL (`@prisma/adapter-pg`)
- `lib/prisma.ts` 根据 `POSTGRES_URL` 环境变量自动选择
- `scripts/vercel-build.sh` 在构建时自动切换 schema

### 食物数据库
- 190 种食物存储在 `src/data/foods.ts` 静态数据中
- 首次部署通过 `prisma/seed.ts` 导入 SQLite
- 搜索接口 `/api/foods?q=xxx` 同时搜索静态数据和数据库

## 部署

### Vercel 部署方式

1. 推送代码到 Git 仓库
2. 在 Vercel 导入项目
3. 创建 Vercel Postgres 数据库（自动注入 `POSTGRES_URL`）
4. 设置环境变量：`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DEEPSEEK_API_KEY`
5. 构建命令: `bash scripts/vercel-build.sh`

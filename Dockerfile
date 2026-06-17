# ── WeightTrack Docker 镜像 ──
FROM node:20-slim

# 安装 better-sqlite3 编译依赖
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./
RUN npm ci

# 设置构建阶段环境变量（用于 Prisma 生成）
ENV DATABASE_URL="file:./prisma/dev.db"

# 复制源码
COPY . .

# 生成 Prisma Client（使用 SQLite schema）
RUN npx prisma generate

# 创建数据库表
RUN npx prisma db push

# 导入 190 种食物数据
RUN npx tsx prisma/seed.ts

# 生产构建
RUN npm run build

# 清理 devDependencies
RUN npm prune --production
RUN apt-get remove -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]

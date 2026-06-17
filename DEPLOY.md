# WeightTrack 部署指南

> 三种方式部署 WeightTrack：Docker（最推荐）、Gitee Go 自动部署、手动部署。

---

## 🐳 方式一：Docker 部署（推荐）

> 一行命令，5 分钟搞定。不污染服务器环境，数据持久化在 Docker Volume 中。

### 前置条件

- **一台服务器**（任意 Linux，1GB 内存+）
- **安装了 Docker**（如未安装，脚本会自动安装）

### 部署步骤

在**服务器 SSH 终端**运行：

```bash
# 1. 克隆项目
git clone https://gitee.com/luodm/cpbfit.git /opt/weight-track
cd /opt/weight-track

# 2. 一键部署
bash docker-deploy.sh
```

脚本会自动：
1. 检查/安装 Docker + Docker Compose
2. 创建 `.env` 文件（自动生成安全密钥）
3. 构建 Docker 镜像（安装依赖 → 建 SQLite 数据库 → 导入 190 种食物 → 生产构建）
4. 启动容器（端口 3000，数据持久化在 Docker Volume）

### 运行后命令

```bash
docker compose logs -f        # 查看日志
docker compose restart        # 重启应用
docker compose down           # 停止
git pull && docker compose up -d --build  # 更新代码
```

### 备份数据

```bash
docker cp weight-track:/app/prisma/dev.db ./backup-$(date +%Y%m%d).db
```

---

## 🔧 方式二：Gitee Go 自动部署（推荐）

> 代码推送到 Gitee 后自动触发构建和部署到你的服务器。

### 前置条件

1. 项目已推送到 `https://gitee.com/luodm/cpbfit`
2. 一台 Ubuntu/Debian 服务器（已开通 Gitee Go，免费版每月有额度）
3. 服务器已安装基础环境（如有需要，脚本会自动补齐）

### 开启 Gitee Go

1. 打开 [https://gitee.com/luodm/cpbfit](https://gitee.com/luodm/cpbfit)
2. 点击顶部 **「服务」→「Gitee Go」**
3. 点击 **「开启」** 按钮
4. 选择流水线文件来源: **「仓库已存在 .gitee/workflows 目录」**

### 配置服务器密钥

在 Gitee 仓库页面：
1. 点击 **「管理」→「Gitee Go」→「环境变量」**
2. 添加以下变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VPS_HOST` | 服务器公网 IP | `138.2.46.247` |
| `VPS_PORT` | SSH 端口（默认 22） | `22` |
| `VPS_USER` | SSH 用户名 | `root` |
| `VPS_PASSWORD` | SSH 密码 | `你的密码` |
| `NEXTAUTH_SECRET` | JWT 密钥 | `openssl rand -base64 32` 生成 |
| `DEEPSEEK_API_KEY` | AI 功能密钥（可选） | `sk-xxx` |

### 触发部署

- 每次推送代码到 `master` 分支，Gitee Go 会自动：
  1. 拉取代码 → 安装依赖 → 构建
  2. SSH 登录服务器 → 更新代码 → 重建 → 重启应用
  3. 自动配置 Nginx 反向代理（首次）

### 查看运行状态

```bash
# 查看部署日志
Gitee 仓库 → 「Gitee Go」→ 点击运行记录

# 服务器上查看应用
pm2 status
pm2 logs weight-track
```

---

## 🚀 方式三：一键部署脚本

SSH 登录到服务器后，运行：

```bash
# 安装 git（如尚未安装）
apt update && apt install -y git

# 克隆项目
git clone https://gitee.com/luodm/cpbfit.git /tmp/cpbfit

# 运行部署脚本
cd /tmp/cpbfit
bash deploy.sh
```

脚本会交互式询问以下信息：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| 部署目录 | 项目安装在哪个目录 | `/var/www/weight-track` |
| Node.js 版本 | Node.js 主版本号 | `20` |
| 应用端口 | 应用监听端口 | `3000` |
| 域名 | 绑定的域名（留空用 IP） | 空 |
| NEXTAUTH_SECRET | JWT 加密密钥 | 自动生成 |
| DEEPSEEK_API_KEY | AI 功能密钥 | 留空则跳过 |

脚本自动完成：

1. ✅ 系统更新 + 安装 Nginx、Git、curl 等
2. ✅ 安装 Node.js 20
3. ✅ 克隆项目代码到部署目录
4. ✅ 安装 npm 依赖 + 初始化 SQLite 数据库 + 导入 190 种食物数据
5. ✅ 创建 `.env` 环境变量文件
6. ✅ 生产构建 + PM2 启动 + 开机自启
7. ✅ Nginx 反向代理 + 自动 HTTPS（有域名时）

> 部署完成后，直接打开服务器 IP 或域名即可访问。

---

## 📋 方式四：手动部署

> 注意：`git clone` 会直接将项目文件克隆到目标目录，项目没有多级嵌套。
> 如 `git clone ... /var/www/weight-track` 后，项目文件就在 `/var/www/weight-track/` 中。

### 1. 安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs git nginx

# 验证
node -v   # v20.x
npm -v    # 10.x
```

### 2. 获取项目代码

```bash
git clone https://gitee.com/luodm/cpbfit.git /var/www/weight-track
cd /var/www/weight-track
```

### 3. 安装依赖 + 初始化数据库

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 创建数据库表
npx prisma db push

# 导入 190 种食物数据
npx tsx prisma/seed.ts
```

### 4. 配置环境变量

```bash
cat > .env << 'EOF'
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="<用 openssl rand -base64 32 生成>"
NEXTAUTH_URL="http://localhost:3000"
DEEPSEEK_API_KEY="<你的 DeepSeek Key>"
EOF
```

### 5. 构建 + 启动

```bash
# 生产构建
npm run build

# 用 PM2 启动（推荐）
npm install -g pm2
pm2 start npm --name "weight-track" -- start
pm2 save
pm2 startup   # 开机自启
```

### 6. 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/weight-track
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 流式响应支持（AI 功能必需）
        proxy_buffering off;
        proxy_cache off;
    }
}
```

```bash
# 启用站点
ln -s /etc/nginx/sites-available/weight-track /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 7. HTTPS（有域名时）

```bash
# 安装 SSL 证书
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## 日常运维

### 查看应用状态

```bash
pm2 status                # 进程状态
pm2 logs weight-track     # 实时日志
pm2 monit                 # 资源监控
```

### 更新代码

```bash
cd /var/www/weight-track
git pull
npm install
npx prisma generate
npm run build
pm2 restart weight-track
```

### 备份数据

SQLite 数据库文件在 `prisma/dev.db`，直接备份这个文件即可：

```bash
cp /var/www/weight-track/prisma/dev.db ~/backup-$(date +%Y%m%d).db
```

### 重置数据库

```bash
cd /var/www/weight-track
npx prisma db push --force-reset
npx tsx prisma/seed.ts
pm2 restart weight-track
```

---

## 常见问题

### 端口被占用

```bash
# 查找占用 3000 端口的进程
lsof -i :3000
# 或
netstat -tlnp | grep 3000

# 杀掉进程
kill -9 <PID>
```

### Permission denied

```bash
# 如果 pm2 startup 报错，手动创建 systemd 服务
pm2 startup systemd -u root --hp /root
```

### AI 功能报 "未配置 API Key"

```bash
# 编辑 .env，填入 DeepSeek Key 后重启
vim /var/www/weight-track/.env
pm2 restart weight-track
```

### 502 Bad Gateway

通常是 Nginx 连不上应用端口：

```bash
# 检查应用是否运行
pm2 status

# 检查端口
netstat -tlnp | grep 3000

# 重启 Nginx
systemctl reload nginx
```

---

## 系统架构

```
用户浏览器
    │
    ▼
Nginx (端口 80/443, 反向代理)
    │
    ▼
Next.js (端口 3000, PM2 管理)
    │
    ├── SQLite (prisma/dev.db)
    └── DeepSeek API (AI 顾问)
```

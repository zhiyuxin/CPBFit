# WeightTrack VPS 部署指南

> 从零开始在云服务器上部署 WeightTrack，含 Node.js、数据库、Nginx、SSL 全流程。

---

## 前置准备

- **一台云服务器**（阿里云/腾讯云/华为云/搬瓦工等）
  - 系统：Ubuntu 20.04+ / Debian 11+
  - 配置：1核 1GB 起（推荐 2核 2GB）
- **一个域名**（可选，如果用 IP 访问则不需要）
- **DeepSeek API Key**（可选，AI 功能需要）

---

## 方式一：一键部署脚本（推荐）

SSH 登录到服务器后，运行：

```bash
# 安装 git（如尚未安装）
apt update && apt install -y git

# 克隆项目
git clone https://gitee.com/luodm/cpbfit.git /tmp/cpbfit

# 运行部署脚本
cd /tmp/cpbfit/weight-track
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
3. ✅ 克隆项目代码
4. ✅ 安装 npm 依赖 + 初始化 SQLite 数据库 + 导入食物数据
5. ✅ 创建 `.env` 环境变量文件
6. ✅ 构建生产版本 + 用 PM2 启动 + 设置开机自启
7. ✅ 配置 Nginx 反向代理 + 自动 HTTPS（有域名时）

> 部署完成后，直接打开服务器 IP 或域名即可访问。

---

## 方式二：手动部署

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
cd /var/www/weight-track/weight-track
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
cd /var/www/weight-track/weight-track
git pull
npm install
npx prisma generate
npm run build
pm2 restart weight-track
```

### 备份数据

SQLite 数据库文件在 `prisma/dev.db`，直接备份这个文件即可：

```bash
cp /var/www/weight-track/weight-track/prisma/dev.db ~/backup-$(date +%Y%m%d).db
```

### 重置数据库

```bash
cd /var/www/weight-track/weight-track
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
vim /var/www/weight-track/weight-track/.env
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

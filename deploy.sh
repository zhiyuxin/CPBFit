#!/bin/bash
# ============================================================
# WeightTrack VPS 一键部署脚本
# 适用系统: Ubuntu 20.04 / 22.04 / 24.04, Debian 11/12
# 使用方法: bash deploy.sh
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WeightTrack VPS 部署脚本              ${NC}"
echo -e "${BLUE}========================================${NC}"

# ---------- 检查 root ----------
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}建议使用 root 用户运行此脚本 (sudo bash deploy.sh)${NC}"
fi

# ---------- 配置项（可修改）----------
PROJECT_DIR="/var/www/weight-track"
DOMAIN=""                    # 例: weight.yourdomain.com，留空用 IP 访问
NODE_VERSION="20"
GIT_REPO="https://gitee.com/luodm/cpbfit.git"
APP_PORT="3000"
SESSION_SECRET=""
DEEPSEEK_KEY=""

# ---------- 交互输入 ----------
echo ""
echo -e "${YELLOW}请配置以下信息（直接回车使用默认值）：${NC}"
echo ""

read -p "部署目录 [$PROJECT_DIR]: " INPUT_DIR
PROJECT_DIR=${INPUT_DIR:-$PROJECT_DIR}

read -p "Node.js 主版本 [20]: " INPUT_NODE
NODE_VERSION=${INPUT_NODE:-20}

read -p "应用端口 [3000]: " INPUT_PORT
APP_PORT=${INPUT_PORT:-3000}

read -p "域名（留空则用 IP 访问）: " INPUT_DOMAIN
DOMAIN=${INPUT_DOMAIN}

read -p "NEXTAUTH_SECRET（留空自动生成）: " INPUT_SECRET
SESSION_SECRET=${INPUT_SECRET:-$(openssl rand -base64 32)}

read -p "DEEPSEEK_API_KEY（AI 功能，留空则跳过）: " INPUT_DEEPSEEK
DEEPSEEK_KEY=${INPUT_DEEPSEEK}

echo ""
echo -e "${BLUE}========== 部署配置预览 ==========${NC}"
echo -e "  目录:     ${GREEN}$PROJECT_DIR${NC}"
echo -e "  Node:     ${GREEN}$NODE_VERSION${NC}"
echo -e "  端口:     ${GREEN}$APP_PORT${NC}"
echo -e "  域名:     ${GREEN}${DOMAIN:-无 (使用 IP)}${NC}"
echo -e "  AI:       ${GREEN}${DEEPSEEK_KEY:+已配置}${DEEPSEEK_KEY:-跳过}${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
read -p "确认部署？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo -e "${RED}已取消${NC}"
  exit 1
fi

# ==========================================
# 1. 系统更新 + 安装依赖
# ==========================================
echo ""
echo -e "${BLUE}[1/7] 更新系统并安装基础依赖...${NC}"

apt update -y && apt upgrade -y
apt install -y curl git unzip build-essential nginx certbot python3-certbot-nginx openssl

# ==========================================
# 2. 安装 Node.js
# ==========================================
echo ""
echo -e "${BLUE}[2/7] 安装 Node.js $NODE_VERSION ...${NC}"

# 检查当前 Node 版本是否满足要求
CURRENT_NODE=$(node -v 2>/dev/null || echo "v0")
CURRENT_MAJOR=$(echo "$CURRENT_NODE" | sed 's/v//' | cut -d. -f1)

if [ "$CURRENT_MAJOR" -lt "$NODE_VERSION" ] 2>/dev/null; then
  echo -e "  ${YELLOW}当前 Node.js 版本 ($CURRENT_NODE) 过旧，升级到 $NODE_VERSION ...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt install -y nodejs
else
  echo -e "  ${GREEN}Node.js $CURRENT_NODE 已满足要求${NC}"
fi

echo -e "  Node.js: ${GREEN}$(node -v)${NC}"
echo -e "  npm:     ${GREEN}$(npm -v)${NC}"

# ==========================================
# 3. 克隆项目
# ==========================================
echo ""
echo -e "${BLUE}[3/7] 拉取项目代码...${NC}"

mkdir -p "$(dirname "$PROJECT_DIR")"
if [ -d "$PROJECT_DIR" ]; then
  echo "  目录已存在，更新代码..."
  cd "$PROJECT_DIR"
  git pull origin master
else
  git clone "$GIT_REPO" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

# ==========================================
# 4. 安装项目依赖 + 初始化数据库
# ==========================================
echo ""
echo -e "${BLUE}[4/7] 安装项目依赖 & 初始化数据库...${NC}"

cd "$PROJECT_DIR"

# 确保有正确的 package-lock
# 安装依赖（含 devDeps，tsx 需要）
npm install

# 生成 Prisma Client
npx prisma generate

# 数据库迁移（在生产环境用 db push 而非 migrate dev）
npx prisma db push

# 导入食物数据
npx tsx prisma/seed.ts

echo -e "  数据库初始化完成 ✓"

# ==========================================
# 5. 配置环境变量
# ==========================================
echo ""
echo -e "${BLUE}[5/7] 配置环境变量...${NC}"

cat > "$PROJECT_DIR/.env" << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="$SESSION_SECRET"
NEXTAUTH_URL="http://localhost:$APP_PORT"
DEEPSEEK_API_KEY="$DEEPSEEK_KEY"
EOF

echo -e "  .env 文件已生成 ✓"

# ==========================================
# 6. 构建并启动 (PM2)
# ==========================================
echo ""
echo -e "${BLUE}[6/7] 构建并启动应用...${NC}"

cd "$PROJECT_DIR"

# 生产构建
npm run build

# 安装 PM2
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

# 启动应用
pm2 delete weight-track 2>/dev/null || true
pm2 start npm --name "weight-track" -- start
pm2 save

# 设置开机自启
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save

echo -e "  应用已启动: ${GREEN}http://localhost:$APP_PORT${NC}"

# ==========================================
# 7. 配置 Nginx 反向代理
# ==========================================
echo ""
echo -e "${BLUE}[7/7] 配置 Nginx 反向代理...${NC}"

if [ -n "$DOMAIN" ]; then
  NGINX_CONF="/etc/nginx/sites-available/weight-track"
  cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 流式响应支持
        proxy_buffering off;
        proxy_cache off;
    }
}
EOF

  sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$NGINX_CONF"
  sed -i "s/PORT_PLACEHOLDER/$APP_PORT/g" "$NGINX_CONF"

  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default

  nginx -t && systemctl reload nginx

  # 自动 HTTPS
  echo -e "  尝试申请 SSL 证书..."
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" 2>/dev/null || \
    echo -e "${YELLOW}  ⚠ SSL 证书申请失败，可稍后手动运行: certbot --nginx -d $DOMAIN${NC}"

  echo -e "  访问地址: ${GREEN}https://$DOMAIN${NC}"
else
  # 无域名 — 用 IP:端口或配置简单代理
  cat > /etc/nginx/sites-available/weight-track << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_cache off;
    }
}
EOF

  sed -i "s/PORT_PLACEHOLDER/$APP_PORT/g" /etc/nginx/sites-available/weight-track

  ln -sf /etc/nginx/sites-available/weight-track /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default

  nginx -t && systemctl reload nginx

  echo -e "  访问地址: ${GREEN}http://<服务器IP>$([ "$APP_PORT" != "80" ] && echo ":$APP_PORT")${NC}"
fi

# ==========================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  ✅ 部署完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  ${YELLOW}常用命令：${NC}"
echo -e "  查看日志:  ${GREEN}pm2 logs weight-track${NC}"
echo -e "  重启应用:  ${GREEN}pm2 restart weight-track${NC}"
echo -e "  停止应用:  ${GREEN}pm2 stop weight-track${NC}"
echo -e "  查看状态:  ${GREEN}pm2 status${NC}"
echo ""
echo -e "  ${YELLOW}管理员账号（首次访问需注册）：${NC}"
echo -e "  打开页面 → 点击「注册」→ 创建你的账号"
echo ""
echo -e "  ${YELLOW}如需更新代码：${NC}"
echo -e "  cd $PROJECT_DIR && git pull && npm install && npm run build && pm2 restart weight-track"
echo ""

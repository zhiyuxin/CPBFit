#!/bin/bash
# ============================================================
# WeightTrack Docker 部署脚本
# 在你的 VPS 上运行: bash docker-deploy.sh
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WeightTrack Docker 部署               ${NC}"
echo -e "${BLUE}========================================${NC}"

# ── 1. 检查 Docker 是否安装 ──
if ! command -v docker &>/dev/null; then
  echo -e "${YELLOW}[1/4] 安装 Docker...${NC}"
  curl -fsSL https://get.docker.com | bash
  systemctl enable docker
  systemctl start docker
else
  echo -e "${GREEN}[1/4] Docker 已安装 ✓${NC}"
fi

# ── 2. 检查 docker-compose ──
if ! docker compose version &>/dev/null 2>&1; then
  echo -e "${YELLOW}升级 Docker Compose...${NC}"
  apt install -y docker-compose-plugin 2>/dev/null || true
fi
echo -e "${GREEN}[2/4] Docker Compose 已就绪 ✓${NC}"

# ── 3. 配置环境变量 ──
echo -e "${BLUE}[3/4] 配置环境变量...${NC}"

# 生成随机密钥
if [ ! -f .env ]; then
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  cat > .env << EOF
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000
DEEPSEEK_API_KEY=
EOF
  echo -e "  ${GREEN}.env 文件已创建（含自动生成的密钥）${NC}"
else
  echo -e "  ${GREEN}.env 文件已存在，跳过${NC}"
fi

# ── 4. 构建并启动 ──
echo -e "${BLUE}[4/4] 构建 Docker 镜像并启动...${NC}"
docker compose up -d --build

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  ✅ 部署完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  ${YELLOW}常用命令：${NC}"
echo -e "  查看日志:  ${GREEN}docker compose logs -f${NC}"
echo -e "  重启应用:  ${GREEN}docker compose restart${NC}"
echo -e "  停止应用:  ${GREEN}docker compose down${NC}"
echo -e "  更新代码:  ${GREEN}git pull && docker compose up -d --build${NC}"
echo ""
echo -e "  ${YELLOW}数据库备份：${NC}"
echo -e "  ${GREEN}docker cp weight-track:/app/prisma/dev.db ./backup-\$(date +%Y%m%d).db${NC}"
echo ""
IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo -e "  ${YELLOW}访问地址：${NC}"
echo -e "  ${GREEN}http://$IP:3000${NC}"
echo ""
echo -e "  ${YELLOW}如需配置 Nginx 反代 + HTTPS，参考 DEPLOY.md${NC}"

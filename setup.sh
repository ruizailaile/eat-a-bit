#!/usr/bin/env bash
# ============================================================
#  吃一点 · Eat A Bit 项目初始化脚本
#  用法：./setup.sh
#
#  做这些事：
#    1. 检查 Node.js 版本
#    2. 安装依赖
#    3. 复制 .env.example 为 .env.local（如果不存在）
#    4. 提示配置 Supabase 环境变量
#    5. 跑 TypeScript 类型检查验证项目
# ============================================================

set -e

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "  🍽️  吃一点 · Eat A Bit"
echo "  项目初始化脚本"
echo -e "${NC}"

# ------------------------------------------------------------
# Step 1: 检查 Node.js
# ------------------------------------------------------------
echo -e "${BLUE}[1/5]${NC} 检查 Node.js 版本..."

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ 未安装 Node.js，请先安装 Node.js 18+${NC}"
  echo "   下载地址：https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 版本过低：$(node -v)，需要 18+${NC}"
  exit 1
fi

echo -e "${GREEN}   ✓ Node.js $(node -v)${NC}"

# ------------------------------------------------------------
# Step 2: 安装依赖
# ------------------------------------------------------------
echo -e "${BLUE}[2/5]${NC} 安装依赖..."

if [ -f "package-lock.json" ]; then
  npm ci
else
  npm install
fi

echo -e "${GREEN}   ✓ 依赖安装完成${NC}"

# ------------------------------------------------------------
# Step 3: 环境变量
# ------------------------------------------------------------
echo -e "${BLUE}[3/5]${NC} 配置环境变量..."

if [ -f ".env.local" ]; then
  echo -e "${YELLOW}   ⚠ .env.local 已存在，跳过（如需重置请手动删除后重跑）${NC}"
else
  cp .env.example .env.local
  echo -e "${GREEN}   ✓ 已从 .env.example 创建 .env.local${NC}"
fi

# ------------------------------------------------------------
# Step 4: 检查 Supabase 配置
# ------------------------------------------------------------
echo -e "${BLUE}[4/5]${NC} 检查 Supabase 配置..."

SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local 2>/dev/null | cut -d= -f2 || true)
SUPABASE_KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local 2>/dev/null | cut -d= -f2 || true)

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project-id.supabase.co" ]; then
  echo -e "${YELLOW}"
  echo "   ⚠ Supabase 环境变量还没配置！"
  echo ""
  echo "   请按以下步骤配置："
  echo ""
  echo "   1. 打开 https://supabase.com 并创建项目"
  echo "   2. 进入 Project Settings → API"
  echo "   3. 复制 Project URL 和 anon key"
  echo "   4. 编辑 .env.local 填入对应值"
  echo "   5. 执行 supabase/migrations/0001_init.sql 建表"
  echo ""
  echo "   详细步骤见 SETUP.md"
  echo -e "${NC}"
else
  echo -e "${GREEN}   ✓ Supabase URL 已配置${NC}"
fi

# ------------------------------------------------------------
# Step 5: 类型检查验证
# ------------------------------------------------------------
echo -e "${BLUE}[5/5]${NC} 验证 TypeScript 类型..."

if npx tsc --noEmit 2>/dev/null; then
  echo -e "${GREEN}   ✓ 类型检查通过${NC}"
else
  echo -e "${YELLOW}   ⚠ 类型检查有警告或错误（可能是还没写页面，正常）${NC}"
fi

# ------------------------------------------------------------
# 完成
# ------------------------------------------------------------
echo ""
echo -e "${GREEN}🎉 初始化完成！${NC}"
echo ""
echo "   下一步："
echo "   1. 编辑 .env.local 填入 Supabase 配置"
echo "   2. 在 Supabase Dashboard 执行 supabase/migrations/0001_init.sql"
echo "   3. 运行 npm run dev 启动开发服务器"
echo ""
echo "   详细说明：cat SETUP.md"
echo ""

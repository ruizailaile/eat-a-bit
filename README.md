# 🍽️ 吃一点 · Eat A Bit

> 轻量饮食记录 App — 拍个照，记一下，吃多吃少心里有数。

基于 Next.js 14 + Supabase + Tailwind 构建的移动端优先饮食记录应用。

---

## ✨ 功能

### MVP 第一版
- 📧 **邮箱注册 / 登录** — Supabase Auth 一键接入
- 🏠 **今日概览** — 已记录多少顿、总热量一目了然
- 📸 **拍照记录** — 拍张照 + 填个热量，3 秒搞定
- 📅 **历史记录** — 按日期分组，回看每一天吃了啥
- 👤 **个人资料** — 头像、昵称、个性签名随心改

### 规划中
- 🤖 AI 图片识别（拍张照自动识别食物和热量）
- 🔥 连续打卡 / 成就徽章
- 📊 周 / 月统计图表
- 🌙 深色模式

---

## 🚀 快速开始

### 前置要求
- Node.js 18+
- 一个 [Supabase](https://supabase.com) 账号（免费版够用）

### 3 步跑起来

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd eat-little

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 Supabase 信息
```

然后打开浏览器访问 http://localhost:3000

> 完整的 Supabase 配置步骤见 [SETUP.md](./SETUP.md)

---

## 🛠 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 框架 | Next.js 14 (App Router) | React 全栈框架 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS + shadcn/ui | 快速搭界面 |
| 后端 | Supabase | Auth / PostgreSQL / Storage / RLS |
| 部署 | Vercel | Push 即部署 |

详细架构设计见 [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📁 项目结构

```
eat-little/
├── app/
│   ├── (auth)/              # 未登录路由（登录/注册）
│   ├── (app)/               # 需登录路由（首页/记录/历史/个人）
│   ├── api/                 # API 路由（AI 识别等）
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # shadcn 组件
│   ├── GlassCard.tsx
│   ├── FoodCard.tsx
│   ├── PhotoPicker.tsx
│   └── BottomTabBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # 浏览器端 client
│   │   └── server.ts        # 服务端 client
│   ├── types.ts
│   └── utils.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql    # 建表 + RLS + 种子数据
├── public/
├── .env.example
├── package.json
└── README.md
```

---

## 📖 文档

- [快速上手 SETUP.md](./SETUP.md) — Supabase 配置 + 环境变量 + 启动步骤
- [架构设计 ARCHITECTURE.md](./ARCHITECTURE.md) — 技术选型、表结构、RLS 策略、关键流程

---

## 🎯 MVP 范围

### ✅ 做
1. 邮箱注册 / 登录 / 退出
2. 首页：今日已记录 + 总热量概览
3. 添加记录：手动填食物名 + 热量 + 拍照
4. 历史记录列表（按日期分组）
5. 个人资料编辑 + 头像上传

### ❌ 不做（先不做）
- 微信 / 手机号登录
- 社交 / 好友 / 动态
- 推荐算法
- 深色模式
- 复杂动画

---

## 📝 开发命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run start     # 启动生产服务器
npm run lint      # 代码检查
```

---

## 📄 License

MIT

# 吃一点 · Eat A Bit 技术架构

MVP 第一版技术方案 & 快速上手指南

---

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| 后端/数据库 | Supabase（Auth + PostgreSQL + Storage + RLS） |
| 部署 | Vercel |
| 代码托管 | GitHub |

---

## 快速开始（5 步跑起来）

### 第 1 步：创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com) → New Project
2. 免费套餐就行，Region 选离你近的
3. 等项目创建好（约 2 分钟）

### 第 2 步：执行建表 SQL

1. 进入 Supabase Dashboard → SQL Editor
2. 打开 `supabase/migrations/0001_init.sql`，复制全部内容
3. 粘贴到 SQL Editor，点 Run！

> 也可以用 Supabase CLI：`supabase db push`

### 第 3 步：创建 Storage Bucket

1. Dashboard → Storage → New bucket
2. Bucket 名：`food-photos`（Public 关闭，靠 RLS 控制）
3. 在 Storage → Policies 里添加 3 条策略（SQL 里有注释版）：
   - **SELECT**：用户可读自己目录下的图片
   - **INSERT**：用户只能上传到自己的目录
   - **DELETE**：用户只能删自己的图片

   策略模板用 `For SELECT` / `For INSERT` / `For DELETE`，条件参考：
   ```sql
   auth.uid()::text = (storage.foldername(name))[1]
   ```

### 第 4 步：获取环境变量

Dashboard → Project Settings → API

复制以下 3 个值，在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 第 5 步：启动 Next.js

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

---

## 项目结构

```
eat-little/
├── app/
│   ├── (auth)/              # 未登录路由组
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (app)/               # 需登录路由组
│   │   ├── page.tsx         # 首页：今日饮食概览
│   │   ├── record/page.tsx  # 添加记录
│   │   ├── history/page.tsx # 历史记录
│   │   ├── profile/page.tsx # 个人中心
│   │   └── layout.tsx       # 含 BottomTabBar
│   ├── api/
│   │   └── ai/
│   │       └── analyze/route.ts  # 图片识别接口（后期）
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
│   │   ├── client.ts        # 浏览器端（Client Component 用）
│   │   └── server.ts        # 服务端（Server Component / Route Handler 用）
│   ├── types.ts             # 数据库类型定义
│   └── utils.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
├── public/
└── package.json
```

---

## 数据库表

| 表 | 说明 | RLS |
|---|---|---|
| `profiles` | 用户资料 | 用户只能看/改自己的 |
| `foods` | 公共食物库 | 所有人可读 |
| `food_records` | 饮食记录（核心） | 用户只能操作自己的 |
| `favorites` | 收藏食物 | 用户只能操作自己的 |

详细字段见 `supabase/migrations/0001_init.sql`。

---

## 关键流程

### 注册登录

```
邮箱注册 → Supabase Auth 创建用户 → 触发器自动插入 profiles → 跳转首页
```

### 添加饮食记录

```
拍照/选图 → 上传 Storage (food/{user_id}/xxx.jpg) → 拿到路径 → 写入 food_records
```

### 图片识别（后期）

```
前端传图 → /api/ai/analyze → 调多模态模型 → 返回食物名+热量 → 用户确认入库
```

---

## MVP 范围

### 做

1. 邮箱注册 / 登录 / 退出
2. 首页：今日已记录 + 总热量概览
3. 添加记录：手动填食物名 + 热量 + 拍照
4. 历史记录列表（按日期分组）
5. 个人资料编辑 + 头像上传

### 不做

- 微信 / 手机号登录
- 社交 / 好友 / 动态
- 推荐算法
- 深色模式
- 复杂动画

---

## 常用 Supabase 操作速查

### 查询今日记录（Server Component）

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: records } = await supabase
    .from('food_records')
    .select('*')
    .gte('recorded_at', `${today}T00:00:00`)
    .lt('recorded_at', `${today}T23:59:59`)
    .order('recorded_at', { ascending: false });

  return <div>...</div>;
}
```

### 上传图片（Client Component）

```tsx
'use client';
import { createClient } from '@/lib/supabase/client';
import { generateFoodPhotoPath } from '@/lib/utils';

async function uploadPhoto(file: File, userId: string) {
  const supabase = createClient();
  const path = generateFoodPhotoPath(userId);

  const { error } = await supabase.storage
    .from('food-photos')
    .upload(path, file);

  if (error) throw error;
  return path; // 存数据库用路径，不用完整 URL
}
```

### 获取图片公网 URL

```tsx
const { data } = supabase.storage
  .from('food-photos')
  .getPublicUrl(photo_url);

const imgSrc = data.publicUrl;
```

### 新增记录

```tsx
const { data, error } = await supabase
  .from('food_records')
  .insert({
    user_id: userId,     // RLS 会校验，前端也带上保险
    custom_name: '米饭',
    calories: 230,
    photo_url: path,
    recorded_at: new Date().toISOString(),
  })
  .select()
  .single();
```

---

## 开发顺序

1. ✅ 建 Supabase 项目 → 跑 migrations
2. Next.js 接入 Supabase Auth → 登录注册页
3. 首页布局 + BottomTabBar
4. 添加记录表单 + 图片上传
5. 历史记录页
6. 个人资料 + 头像上传
7. Vercel 部署上线测试

# 环境搭建指南

从零开始把「吃一点」跑起来，跟着做就行。

---

## 第 1 步：准备 Supabase

### 1.1 创建项目

1. 打开 [supabase.com](https://supabase.com)，注册/登录
2. 点 **New Project**
3. 填写信息：
   - Name: `eat-little`（随便起）
   - Database Password: 设一个强密码，记下来（后期可能用到）
   - Region: 选离你最近的（比如 `Southeast Asia` 或 `West US`）
   - Plan: Free
4. 点 **Create new project**
5. 等 2 分钟左右，项目初始化完成

### 1.2 执行建表 SQL

1. 左侧菜单 → **SQL Editor**
2. 点 **New query**
3. 打开项目里的 `supabase/migrations/0001_init.sql`，**全选复制**
4. 粘贴到 SQL Editor 里
5. 点右下角 **Run**
6. 看到 `Success. No rows returned` 就成功了

> 💡 也可以用 Supabase CLI：`supabase db push`（需要先装 CLI 并关联项目）

### 1.3 创建 Storage Bucket

1. 左侧菜单 → **Storage**
2. 点 **New bucket**
3. Bucket name: `food-photos`
4. **Public bucket** 关闭（不要开！靠 RLS 控制权限）
5. 点 **Create bucket**

### 1.4 配置 Storage 权限

还是在 Storage 页面，点上方 **Policies** 标签，然后点 **New policy** → **For full customization**，添加以下 3 条策略：

#### 策略 1：用户可读自己的图片

| 项 | 值 |
|---|---|
| Policy name | `用户可读自己的食物图片` |
| Allowed operation | `SELECT` |
| Target roles | `authenticated` |
| USING expression | `bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]` |

#### 策略 2：用户可上传自己的图片

| 项 | 值 |
|---|---|
| Policy name | `用户可上传自己的食物图片` |
| Allowed operation | `INSERT` |
| Target roles | `authenticated` |
| WITH CHECK expression | `bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]` |

#### 策略 3：用户可删除自己的图片

| 项 | 值 |
|---|---|
| Policy name | `用户可删除自己的食物图片` |
| Allowed operation | `DELETE` |
| Target roles | `authenticated` |
| USING expression | `bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]` |

> 💡 三条策略的表达式几乎一样，只是操作类型不同。原理：图片存在 `food/{user_id}/xxx.jpg`，通过 `storage.foldername(name)` 取第一层目录名和当前用户 ID 比较，一致才允许操作。

### 1.5 头像 Bucket（可选，MVP 后期做也行）

和上面一样再建一个 `avatars` bucket，策略表达式把 `food-photos` 换成 `avatars` 即可。

### 1.6 获取环境变量

左侧菜单 → **Project Settings**（齿轮图标）→ **API**

复制两个值：
- **Project URL** → 对应 `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** Project API keys → 对应 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> 🔐 anon key 可以公开放浏览器端，因为 RLS 会在数据库层挡住越权操作。service_role key 才是机密，**千万不要**放到前端或 Git 里。

---

## 第 2 步：配置项目

### 2.1 复制环境变量

```bash
cp .env.example .env.local
```

### 2.2 编辑 .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

把刚才从 Supabase 复制的两个值填进去。

---

## 第 3 步：启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 http://localhost:3000

---

## 第 4 步：验证功能

### 4.1 注册一个账号

1. 打开 http://localhost:3000/login（如果项目做了登录页）
2. 点「注册」，填邮箱和密码
3. 提交后如果跳转到首页，说明 Auth + Profile 触发器工作正常

### 4.2 验证数据库

去 Supabase Dashboard → **Table Editor** → `profiles` 表，应该能看到刚注册的用户。

### 4.3 验证 RLS（重要）

打开浏览器开发者工具 → Console，执行：

```js
// 故意尝试读取别人的数据（不会成功，因为 RLS 挡住了）
const { data, error } = await supabase
  .from('food_records')
  .select('*')
  .eq('user_id', '随便一个不存在的uuid')
```

应该返回空数组或 0 条，说明 RLS 生效了。

---

## 第 5 步：部署到 Vercel（可选）

1. 代码推送到 GitHub
2. 打开 [vercel.com](https://vercel.com) → New Project → Import 你的仓库
3. Environment Variables 里填入 `.env.local` 的两个变量
4. 点 Deploy
5. 等 1 分钟，部署完成

> ⚠️ 部署后记得去 Supabase → **Auth** → **URL Configuration** → **Site URL** 改成你的 Vercel 域名，不然登录跳转可能有问题。

---

## 常见问题

### Q: 本地开发 getUserMedia 相机打不开？

A: `getUserMedia` 只在 HTTPS 或 localhost 下可用。本地开发用 `localhost:3000` 没问题。手机测试的话需要配 HTTPS 或用 ngrok 之类的工具。

### Q: Supabase 免费版有什么限制？

A: 免费版 500MB 数据库 + 1GB Storage，MVP 测试完全够用。超出了再升级。

### Q: 邮箱注册需要验证邮件吗？

A: 默认需要。测试阶段可以在 Supabase → Auth → Providers → Email 里关掉 Confirm email。

### Q: 怎么重置数据库？

A: SQL Editor 里执行：
```sql
DROP TABLE IF EXISTS food_records, favorites, foods, profiles CASCADE;
```
然后重新跑一遍 `0001_init.sql`。（⚠️ 会清空所有数据，谨慎操作！）

---

## 下一步

环境跑通后，可以按这个顺序开发页面：

1. ✅ Supabase 配置 + SQL（已完成）
2. 登录 / 注册页
3. 首页（今日概览）
4. BottomTabBar 底部导航
5. 添加记录页
6. 历史记录页
7. 个人资料页
8. 部署上线

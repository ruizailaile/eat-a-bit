-- ============================================================
--  吃一点 (Eat A Bit) - MVP 第一版数据库初始化
--  执行方式：Supabase Dashboard → SQL Editor → 粘贴运行
--  或：supabase db push（本地 CLI）
-- ============================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  1. profiles — 用户资料
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
--  2. foods — 公共食物库（所有人可读，管理员可写）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.foods (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  default_calories INT  NOT NULL DEFAULT 0,
  category         TEXT NOT NULL DEFAULT '其他', -- 主食/肉蛋/蔬菜/水果/饮料/零食/其他
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
--  3. food_records — 饮食记录（核心表）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_id     UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  custom_name TEXT,                         -- 未匹配食物库时的自定义名称
  photo_url   TEXT,                         -- Storage 路径，非完整 URL
  calories    INT  NOT NULL DEFAULT 0,      -- 热量（大卡）
  note        TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- 实际吃的时间
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()   -- 记录创建时间
);

-- 索引：按用户 + 时间倒序查历史记录
CREATE INDEX IF NOT EXISTS idx_food_records_user_recorded_at
  ON public.food_records (user_id, recorded_at DESC);

-- ============================================================
--  4. favorites — 常用食物
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_id    UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, food_id)  -- 同一食物不重复收藏
);

-- ============================================================
--  5. 触发器：注册时自动创建 profile
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', '吃货'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
--  6. RLS 行级安全策略
--  核心原则：不靠前端判断，数据库层直接拒绝越权
-- ============================================================

-- 开启 RLS
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites    ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------
-- 用户可读自己的 profile，可更新自己的
CREATE POLICY "用户可读自己的资料"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户可更新自己的资料"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ---------- foods ----------
-- 所有人可读食物库（匿名 + 已登录）
CREATE POLICY "所有人可读食物库"
  ON public.foods FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------- food_records ----------
-- 用户只能看/增/改/删自己的记录
CREATE POLICY "用户可操作自己的饮食记录"
  ON public.food_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- favorites ----------
CREATE POLICY "用户可操作自己的收藏"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
--  7. Storage Bucket（需要在 Dashboard 手动创建或用 CLI）
--     bucket 名：food-photos
--     策略：用户只能上传/下载自己目录下的图片
--     路径规则：food/{user_id}/xxx.jpg
-- ============================================================
-- 以下 Storage 策略在 Dashboard → Storage → Policies 中配置：
--
--  -- 读：用户只能读自己目录下的图片
--  CREATE POLICY "用户可读自己的食物图片"
--    ON storage.objects FOR SELECT
--    USING (
--      bucket_id = 'food-photos'
--      AND auth.uid()::text = (storage.foldername(name))[1]
--    );
--
--  -- 写：用户只能上传到自己的目录
--  CREATE POLICY "用户可上传自己的食物图片"
--    ON storage.objects FOR INSERT
--    WITH CHECK (
--      bucket_id = 'food-photos'
--      AND auth.uid()::text = (storage.foldername(name))[1]
--    );
--
--  -- 删：用户只能删自己的图片
--  CREATE POLICY "用户可删除自己的食物图片"
--    ON storage.objects FOR DELETE
--    USING (
--      bucket_id = 'food-photos'
--      AND auth.uid()::text = (storage.foldername(name))[1]
--    );

-- ============================================================
--  8. 种子数据：预置一些常见食物（可选，方便测试）
-- ============================================================
INSERT INTO public.foods (name, default_calories, category) VALUES
  ('白米饭',       230, '主食'),
  ('馒头',         220, '主食'),
  ('面条（一碗）', 280, '主食'),
  ('鸡蛋',          70, '肉蛋'),
  ('鸡胸肉(100g)', 165, '肉蛋'),
  ('牛肉(100g)',   250, '肉蛋'),
  ('猪肉(100g)',   242, '肉蛋'),
  ('苹果',          52, '水果'),
  ('香蕉',          89, '水果'),
  ('西兰花(100g)',  34, '蔬菜'),
  ('番茄',          18, '蔬菜'),
  ('黄瓜',          16, '蔬菜'),
  ('牛奶(250ml)',  150, '饮料'),
  ('可乐(330ml)',  140, '饮料'),
  ('豆浆(250ml)',   80, '饮料'),
  ('薯片(一包)',   536, '零食'),
  ('巧克力(100g)', 546, '零食')
ON CONFLICT DO NOTHING;

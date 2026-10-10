import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/GlassCard';
import { formatDate, sumCalories } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Flame } from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser();

  // 获取今日记录
  const today = formatDate(new Date());
  const { data: records } = await supabase
    .from('food_records')
    .select('*')
    .gte('recorded_at', `${today}T00:00:00`)
    .lt('recorded_at', `${today}T23:59:59`)
    .order('recorded_at', { ascending: false });

  const totalCalories = sumCalories(records || []);
  const recordCount = records?.length || 0;

  // 获取用户资料
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url')
    .eq('id', user?.id || '')
    .single();

  return (
    <div className="container pt-4 page-enter">
      {/* 顶部问候 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-text-sub">你好 👋</p>
          <h1 className="text-xl font-bold text-text">
            {profile?.nickname || '吃货'}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <span className="text-brand text-lg">
            {profile?.nickname?.[0] || '吃'}
          </span>
        </div>
      </div>

      {/* 今日概览卡片 */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            <span className="font-semibold text-text">今日热量</span>
          </div>
          <span className="text-xs text-text-muted">
            {today.slice(5).replace('-', '月')}日
          </span>
        </div>

        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-extrabold text-accent">
            {totalCalories}
          </span>
          <span className="text-sm text-text-sub mb-1">大卡</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-sub">
            已记录 <span className="font-semibold text-text">{recordCount}</span> 顿
          </span>
          <Link
            href="/record"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand text-white text-xs font-medium tap-scale"
          >
            <Plus className="w-3.5 h-3.5" />
            加一餐
          </Link>
        </div>
      </GlassCard>

      {/* 今日记录列表 */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-text mb-3">
          今天吃了啥
        </h2>

        {records && records.length > 0 ? (
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <GlassCard key={record.id} className="p-3 flex items-center gap-3">
                {record.photo_url ? (
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex-shrink-0 overflow-hidden">
                    {/* 图片后期接 Supabase Storage */}
                    <div className="w-full h-full flex items-center justify-center text-brand text-lg">
                      🍽️
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex-shrink-0 flex items-center justify-center text-xl">
                    🍽️
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">
                    {record.custom_name || '未命名食物'}
                  </p>
                  <p className="text-xs text-text-sub">
                    {new Date(record.recorded_at).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{record.calories}</p>
                  <p className="text-[10px] text-text-sub">大卡</p>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <p className="text-4xl mb-3">🍜</p>
            <p className="text-sm text-text-sub mb-3">今天还没记录哦</p>
            <Link
              href="/record"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-brand text-white text-sm font-medium tap-scale"
            >
              <Plus className="w-4 h-4" />
              记录第一餐
            </Link>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

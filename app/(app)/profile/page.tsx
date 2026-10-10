import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/GlassCard';
import { User, Settings, LogOut, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single();

  // 统计数据
  const { count: totalRecords } = await supabase
    .from('food_records')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="container pt-4 pb-8 page-enter">
      {/* 用户信息卡片 */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-2xl font-bold">
            {profile?.nickname?.[0] || '吃'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text">
              {profile?.nickname || '吃货'}
            </h2>
            <p className="text-sm text-text-sub mt-0.5">
              {profile?.bio || '记录每一餐，好好吃饭'}
            </p>
          </div>
          <button className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-brand" />
          </button>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xl font-bold text-text">{totalRecords || 0}</p>
            <p className="text-xs text-text-sub mt-0.5">总记录</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-xl font-bold text-text">0</p>
            <p className="text-xs text-text-sub mt-0.5">打卡天数</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-text">0</p>
            <p className="text-xs text-text-sub mt-0.5">收藏食物</p>
          </div>
        </div>
      </GlassCard>

      {/* 功能列表 */}
      <GlassCard className="overflow-hidden p-0 mb-4">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 tap-scale"
        >
          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="w-4 h-4 text-accent" />
          </div>
          <span className="flex-1 text-sm text-text">编辑资料</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>

        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 tap-scale"
        >
          <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-brand" />
          </div>
          <span className="flex-1 text-sm text-text">我的收藏</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>

        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3.5 tap-scale"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <Settings className="w-4 h-4 text-blue-500" />
          </div>
          <span className="flex-1 text-sm text-text">设置</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
      </GlassCard>

      {/* 退出登录 */}
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-red-50 text-red-500 text-sm font-medium flex items-center justify-center gap-2 tap-scale"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </form>
    </div>
  );
}

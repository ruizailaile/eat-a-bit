import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/GlassCard';
import { groupByDate, sumCalories, formatDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export default async function HistoryPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 获取最近 30 天的记录
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: records } = await supabase
    .from('food_records')
    .select('*')
    .gte('recorded_at', thirtyDaysAgo.toISOString())
    .order('recorded_at', { ascending: false });

  const grouped = groupByDate(records || []);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const today = formatDate(new Date());

  function formatDateLabel(dateStr: string) {
    if (dateStr === today) return '今天';
    const d = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === formatDate(yesterday)) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return (
    <div className="container pt-4 pb-8 page-enter">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-brand" />
        <h1 className="text-xl font-bold text-text">历史记录</h1>
      </div>

      {dates.length > 0 ? (
        <div className="space-y-6">
          {dates.map((date) => {
            const dayRecords = grouped[date];
            const dayTotal = sumCalories(dayRecords);

            return (
              <div key={date}>
                {/* 日期标题 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">
                      {formatDateLabel(date)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {date.slice(5).replace('-', '/')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-accent">{dayTotal}</span>
                    <span className="text-xs text-text-sub ml-1">大卡</span>
                  </div>
                </div>

                {/* 当天记录列表 */}
                <div className="space-y-2">
                  {dayRecords.map((record) => (
                    <GlassCard
                      key={record.id}
                      className="p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex-shrink-0 flex items-center justify-center">
                        🍽️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text text-sm truncate">
                          {record.custom_name || '未命名食物'}
                        </p>
                        <p className="text-xs text-text-sub">
                          {new Date(record.recorded_at).toLocaleTimeString(
                            'zh-CN',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                          {record.note && ` · ${record.note}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent text-sm">
                          {record.calories}
                        </p>
                        <p className="text-[10px] text-text-sub">大卡</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-sm text-text-sub mb-2">还没有记录</p>
          <p className="text-xs text-text-muted">
            开始记录你的第一餐吧！
          </p>
        </GlassCard>
      )}
    </div>
  );
}

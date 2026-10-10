import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 className（shadcn 标准工具）
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 格式化时间为 HH:mm
 */
export function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * 格式化日期时间为友好显示
 * 今天 → HH:mm，昨天 → 昨天 HH:mm，更早 → MM-DD HH:mm
 */
export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);

  const time = formatTime(d);

  if (diffDays === 0) return time;
  if (diffDays === 1) return `昨天 ${time}`;
  if (diffDays < 7) return `${diffDays}天前`;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${time}`;
}

/**
 * 按日期分组饮食记录
 */
export function groupByDate<T extends { recorded_at: string }>(records: T[]): Record<string, T[]> {
  return records.reduce((acc, record) => {
    const date = formatDate(new Date(record.recorded_at));
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * 计算一天的总热量
 */
export function sumCalories<T extends { calories: number }>(records: T[]): number {
  return records.reduce((sum, r) => sum + (r.calories || 0), 0);
}

/**
 * 生成 Storage 路径：food/{user_id}/{timestamp}_{random}.jpg
 */
export function generateFoodPhotoPath(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `food/${userId}/${timestamp}_${random}.jpg`;
}

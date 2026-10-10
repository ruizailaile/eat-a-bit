/**
 * 数据库类型定义
 * （正式项目建议用 supabase gen types 自动生成，这里先手写 MVP 用）
 */

export interface Profile {
  id: string;          // uuid
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Food {
  id: string;               // uuid
  name: string;
  default_calories: number;
  category: string;         // 主食/肉蛋/蔬菜/水果/饮料/零食/其他
  created_at: string;
}

export interface FoodRecord {
  id: string;          // uuid
  user_id: string;     // uuid
  food_id: string | null;
  custom_name: string | null;
  photo_url: string | null;   // Storage 路径，不是完整 URL
  calories: number;
  note: string | null;
  recorded_at: string; // ISO 字符串
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  food_id: string;
  created_at: string;
}

/**
 * 食物分类枚举
 */
export const FOOD_CATEGORIES = [
  '主食',
  '肉蛋',
  '蔬菜',
  '水果',
  '饮料',
  '零食',
  '其他',
] as const;

export type FoodCategory = typeof FOOD_CATEGORIES[number];

/**
 * 新建饮食记录的表单数据
 */
export interface CreateFoodRecordInput {
  food_id?: string;
  custom_name?: string;
  photo_url?: string;
  calories: number;
  note?: string;
  recorded_at: string;  // ISO 字符串
}

/**
 * 每日统计
 */
export interface DailyStats {
  date: string;        // YYYY-MM-DD
  total_calories: number;
  record_count: number;
}

/**
 * 应用常量
 */

// 应用信息
export const APP_NAME = '吃一点';
export const APP_NAME_EN = 'Eat A Bit';
export const APP_DESCRIPTION = '轻量饮食记录 App — 拍个照，记一下，吃多吃少心里有数。';

// Storage bucket 名
export const STORAGE_BUCKETS = {
  FOOD_PHOTOS: 'food-photos',
  AVATARS: 'avatars',
} as const;

// 每日推荐热量（只是展示用的参考值，MVP 阶段写死）
export const DAILY_CALORIE_GOAL = 2000;

// 食物分类
export const FOOD_CATEGORIES = [
  { value: '主食', label: '主食', emoji: '🍚' },
  { value: '肉蛋', label: '肉蛋', emoji: '🍳' },
  { value: '蔬菜', label: '蔬菜', emoji: '🥦' },
  { value: '水果', label: '水果', emoji: '🍎' },
  { value: '饮料', label: '饮料', emoji: '🥤' },
  { value: '零食', label: '零食', emoji: '🍿' },
  { value: '其他', label: '其他', emoji: '🍽️' },
] as const;

export type FoodCategory = typeof FOOD_CATEGORIES[number]['value'];

// 分页
export const PAGE_SIZE = {
  RECORDS: 20,
  FOODS: 50,
} as const;

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RECORD: '/record',
  HISTORY: '/history',
  PROFILE: '/profile',
  AUTH_CALLBACK: '/auth/callback',
} as const;

// 图片限制
export const IMAGE_LIMITS = {
  MAX_SIZE_MB: 5,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
} as const;

import { createBrowserClient } from '@supabase/ssr';

/**
 * 浏览器端 Supabase Client
 * 用法：Client Component 中使用
 *
 * 需要的环境变量：
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

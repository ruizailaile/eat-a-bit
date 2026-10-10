import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 服务端 Supabase Client（Server Components / Route Handlers / Server Actions）
 * 用法：
 *   import { createClient } from '@/lib/supabase/server';
 *   const supabase = createClient();
 *
 * 需要的环境变量：
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions),
            );
          } catch {
            // 在 Server Component 中调用 set 会报错（只能在 Route Handler / Server Action 中）
            // 这里忽略，不影响读取
          }
        },
      },
    },
  );
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth 回调路由
 * Supabase 邮箱验证 / OAuth 登录后会跳转到这里
 * 这里负责把 cookie 写好，然后跳转到对应页面
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 失败了就回登录页
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

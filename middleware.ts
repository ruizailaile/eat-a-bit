import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 鉴权中间件
 *
 * 规则：
 * - (auth) 路由组下的页面：已登录用户访问 → 跳转到首页
 * - (app) 路由组下的页面：未登录用户访问 → 跳转到登录页
 * - 其他路由：不拦截
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    },
  );

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');
  const isAppRoute =
    path === '/' ||
    path.startsWith('/record') ||
    path.startsWith('/history') ||
    path.startsWith('/profile');

  // 未登录 + 访问需要登录的页面 → 跳登录
  if (!user && isAppRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', path);
    return NextResponse.redirect(redirectUrl);
  }

  // 已登录 + 访问登录/注册页 → 跳首页
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态资源)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 目录下的文件
     * - api 路由（自己控制权限）
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};

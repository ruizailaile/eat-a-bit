'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/GlassCard';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部装饰 */}
      <div className="h-48 bg-gradient-to-br from-brand/20 to-brand-light/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-brand-dark">吃一点</h1>
          <p className="text-sm text-brand/70">Eat A Bit</p>
        </div>
      </div>

      {/* 登录表单 */}
      <div className="flex-1 px-6 -mt-6">
        <GlassCard className="p-6 mb-4">
          <h2 className="text-lg font-bold text-text mb-4">登录</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-sub mb-1.5 block">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-white border border-border',
                  'text-text placeholder:text-text-muted',
                  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
                  'transition-all',
                )}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-sub mb-1.5 block">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className={cn(
                    'w-full px-4 py-3 pr-12 rounded-xl',
                    'bg-white border border-border',
                    'text-text placeholder:text-text-muted',
                    'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
                    'transition-all',
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-sub"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-xl',
                'bg-gradient-to-r from-brand to-brand-dark',
                'text-white font-semibold',
                'shadow-soft',
                'tap-scale',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2',
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>
          </form>
        </GlassCard>

        <p className="text-center text-sm text-text-sub">
          还没有账号？{' '}
          <Link href="/register" className="text-brand font-medium">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}

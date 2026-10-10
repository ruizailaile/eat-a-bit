'use client';

import { Home, History, User, Camera } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'home', label: '首页', icon: Home, href: '/' },
  { key: 'history', label: '历史', icon: History, href: '/history' },
  { key: 'record', label: '记录', icon: Camera, href: '/record', isCenter: true },
  { key: 'profile', label: '我的', icon: User, href: '/profile' },
];

interface BottomTabBarProps {
  className?: string;
}

/**
 * 底部导航栏
 *
 * 布局：首页 | 历史 | （中间大相机按钮） | 我的
 * 注意：record 按钮是居中突出的大按钮
 */
export function BottomTabBar({ className }: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      {/* 背景磨砂 */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-t border-white/60" />

      <div className="relative max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          if (tab.isCenter) {
            // 中间大相机按钮
            return (
              <button
                key={tab.key}
                onClick={() => router.push(tab.href)}
                className="relative -mt-6 tap-scale"
                aria-label={tab.label}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-soft">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 tap-scale',
                'transition-colors duration-200',
              )}
              aria-label={tab.label}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  active ? 'text-brand' : 'text-text-muted',
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active ? 'text-brand' : 'text-text-muted',
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

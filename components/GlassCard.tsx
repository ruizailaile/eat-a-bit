'use client';

import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

/**
 * 磨砂玻璃卡片
 *
 * 用法：
 *   <GlassCard>内容</GlassCard>
 *   <GlassCard hover className="p-4">可悬停的卡片</GlassCard>
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl bg-white/65 backdrop-blur-xl',
          'border border-white/60',
          'shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_0_0_0.5px_rgba(255,255,255,0.6)]',
          hover && 'transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';

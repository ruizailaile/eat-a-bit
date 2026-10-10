'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 打印错误到控制台方便调试
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <div className="text-6xl mb-4">😅</div>
        <h2 className="text-xl font-bold text-text mb-2">出了点小问题</h2>
        <p className="text-sm text-text-sub mb-6">
          {error.message || '页面加载失败，请重试'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-full bg-brand text-white text-sm font-medium tap-scale"
          >
            重试
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-white border border-border text-text text-sm font-medium tap-scale"
          >
            回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-xl font-bold text-text mb-2">页面走丢了</h2>
        <p className="text-sm text-text-sub mb-6">
          这道菜不在菜单上，回首页看看吧
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-brand text-white text-sm font-medium tap-scale"
        >
          回首页
        </Link>
      </div>
    </div>
  );
}

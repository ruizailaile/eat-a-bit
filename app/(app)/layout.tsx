import { BottomTabBar } from '@/components/BottomTabBar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* 主内容区 - 留出底部导航栏高度 */}
      <main className="pb-20">{children}</main>

      {/* 底部导航 */}
      <BottomTabBar />
    </div>
  );
}

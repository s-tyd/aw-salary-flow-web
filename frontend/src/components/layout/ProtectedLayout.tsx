"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MainLayout from "./MainLayout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * 認証が必要なページ用のレイアウトコンポーネント
 * MainLayoutに認証チェック機能を追加
 */
export default function ProtectedLayout({
  children,
  currentPath,
  title,
  subtitle,
  className,
}: ProtectedLayoutProps) {
  const { user, loading } = useAuthGuard();

  if (loading) {
    return <LoadingSpinner message="読み込み中..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout
      currentPath={currentPath}
      title={title}
      subtitle={subtitle}
      className={className}
    >
      {children}
    </MainLayout>
  );
}

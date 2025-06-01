'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * 全ページ共通のメインレイアウトコンポーネント
 * サイドバー、ページトランジション、タイトル表示を統一管理
 */
export default function MainLayout({ 
  children, 
  currentPath, 
  title, 
  subtitle,
  className = ""
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath={currentPath} />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className={`p-4 lg:p-6 max-w-7xl mx-auto ${className}`}>
              {(title || subtitle) && (
                <div className="mb-6">
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {children}
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
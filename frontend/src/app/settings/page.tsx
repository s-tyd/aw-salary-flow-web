"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import Tabs from "@/components/Tabs";
import UserManagement from "@/components/UserManagement";
import PageTransition from "@/components/PageTransition";

export default function SettingsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();

  // 一般設定タブの内容
  const GeneralTab = () => (
    <div className="space-y-6">
      {/* ユーザー情報セクション */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          ユーザー情報
        </h2>
        {user && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                名前
              </label>
              <p className="text-gray-900 dark:text-white">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                メールアドレス
              </label>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* テーマ設定セクション */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          外観設定
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 dark:text-white font-medium">テーマ</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              現在のテーマ: {theme === "light" ? "ライト" : "ダーク"}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* システム情報セクション */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          システム情報
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              アプリケーション名
            </span>
            <span className="text-gray-900 dark:text-white">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">バージョン</span>
            <span className="text-gray-900 dark:text-white">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">最終更新</span>
            <span className="text-gray-900 dark:text-white">-</span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "general",
      label: "一般",
      content: <GeneralTab />,
    },
    {
      id: "users",
      label: "ユーザー管理",
      content: <UserManagement />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath="/settings" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className="max-w-6xl mx-auto p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                設定
              </h1>
              <Tabs tabs={tabs} defaultTab="general" />
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}

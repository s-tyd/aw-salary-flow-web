"use client";

import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface UserActionsProps {
  isCollapsed: boolean;
}

export default function UserActions({ isCollapsed }: UserActionsProps) {
  const { user, logout } = useAuth();

  return (
    <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
      {/* テーマトグル */}
      <div
        className={`flex ${isCollapsed ? "justify-center" : "justify-between"} items-center`}
      >
        {!isCollapsed && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            テーマ
          </span>
        )}
        <ThemeToggle />
      </div>

      {/* ユーザー情報とサインアウト */}
      {user && (
        <div className="space-y-2">
          {!isCollapsed && (
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </p>
          )}
          <button
            onClick={logout}
            className={`w-full px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors ${
              isCollapsed ? "text-center" : ""
            }`}
            title={isCollapsed ? "サインアウト" : undefined}
          >
            {isCollapsed ? "出" : "サインアウト"}
          </button>
        </div>
      )}
    </div>
  );
}

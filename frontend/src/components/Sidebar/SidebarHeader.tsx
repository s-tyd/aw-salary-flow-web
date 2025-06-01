"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapsed: (e?: React.MouseEvent) => void;
}

export default function SidebarHeader({
  isCollapsed,
  onToggleCollapsed,
}: SidebarHeaderProps) {
  return (
    <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700 relative h-20 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3 min-w-0">
          {!isCollapsed && (
            <>
              <img
                src="/logo.png"
                alt="Agileware Logo"
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                <div>Agileware</div>
                <div>給与計算</div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          title={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          aria-label={
            isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"
          }
        >
          {isCollapsed ? (
            <ChevronRight
              size={16}
              className="text-gray-600 dark:text-gray-400"
            />
          ) : (
            <ChevronLeft
              size={16}
              className="text-gray-600 dark:text-gray-400"
            />
          )}
        </button>
      </div>
    </div>
  );
}

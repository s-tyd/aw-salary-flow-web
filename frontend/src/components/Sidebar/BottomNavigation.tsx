"use client";

import { useRouter } from "next/navigation";
import { bottomNavigationItems } from "./NavigationItems";

interface BottomNavigationProps {
  currentPath?: string;
  isCollapsed: boolean;
}

export default function BottomNavigation({
  currentPath,
  isCollapsed,
}: BottomNavigationProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
      <ul className="space-y-1">
        {bottomNavigationItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-3 px-3"} py-2 text-sm font-medium rounded-md transition-colors ${
                currentPath === item.href
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className="text-current flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

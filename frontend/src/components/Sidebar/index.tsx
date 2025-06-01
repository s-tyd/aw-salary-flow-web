"use client";

import { useSidebarState } from "@/hooks/useSidebarState";
import SidebarHeader from "./SidebarHeader";
import NavigationItems from "./NavigationItems";
import DateSelector from "./DateSelector";
import BottomNavigation from "./BottomNavigation";
import UserActions from "./UserActions";

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const { isCollapsed, isMounted, toggleCollapsed } = useSidebarState();

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-56 lg:w-64"} h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 hidden md:flex ${isMounted ? "transition-all duration-300 ease-in-out" : ""}`}
      suppressHydrationWarning
    >
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <NavigationItems currentPath={currentPath} isCollapsed={isCollapsed} />
      <DateSelector isCollapsed={isCollapsed} />
      <BottomNavigation currentPath={currentPath} isCollapsed={isCollapsed} />
      <UserActions isCollapsed={isCollapsed} />
    </div>
  );
}

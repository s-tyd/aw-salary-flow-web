"use client";

import { useState, ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [renderedTabs, setRenderedTabs] = useState<Set<string>>(
    new Set([defaultTab || tabs[0]?.id])
  );

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setRenderedTabs(prev => new Set([...prev, tabId]));
  };

  return (
    <div>
      {/* タブヘッダー */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-6 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const shouldRender = renderedTabs.has(tab.id);
          
          if (!shouldRender) return null;
          
          return (
            <div
              key={tab.id}
              className={`transition-opacity duration-200 ease-in-out ${
                isActive 
                  ? "opacity-100 relative" 
                  : "opacity-0 absolute inset-0 pointer-events-none"
              }`}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

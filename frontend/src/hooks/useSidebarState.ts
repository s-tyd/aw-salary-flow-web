'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sidebar-collapsed';

export function useSidebarState() {
  const getInitialState = () => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  };
  
  const [isCollapsed, setIsCollapsed] = useState(getInitialState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleCollapsed = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsCollapsed((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  return {
    isCollapsed,
    isMounted,
    toggleCollapsed,
  };
}
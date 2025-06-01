"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  ariaLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'gray' | 'purple';
  tooltip?: string;
}

export default function FloatingButton({
  onClick,
  icon: Icon,
  ariaLabel = 'フローティングボタン',
  className = '',
  size = 'md',
  color = 'blue',
  tooltip
}: FloatingButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    gray: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28
  };

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`
          fixed bottom-6 right-6 z-50
          ${sizeClasses[size]}
          ${colorClasses[color]}
          text-white rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-300
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          transform hover:scale-110 active:scale-95
          ${className}
        `}
      >
        <Icon size={iconSizes[size]} className="mx-auto" />
      </button>
      
      {/* ツールチップ */}
      {tooltip && (
        <div className="fixed bottom-6 right-20 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {tooltip}
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * 汎用データサマリーコンポーネント
 */

import React from 'react';

export interface SummaryItem {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'red' | 'yellow';
}

export interface BreakdownItem {
  label: string;
  count?: number;
  amount?: number;
  extra?: string;
  sublabel?: string;
  isHighlight?: boolean;
}

interface DataSummaryProps {
  title: string;
  items: SummaryItem[];
  breakdown?: {
    title: string;
    description?: string;
    items: BreakdownItem[];
  };
}

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  indigo: 'text-indigo-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
};

export default function DataSummary({ title, items, breakdown }: DataSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      
      {/* 主要指標 */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${items.length >= 5 ? 'lg:grid-cols-5' : items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {items.map((item, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl font-bold ${colorClasses[item.color]}`}>
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </div>
            <div className="text-sm text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
      
      {/* 詳細内訳 */}
      {breakdown && (
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-gray-900">{breakdown.title}</h3>
            {breakdown.description && (
              <p className="text-xs text-gray-500">{breakdown.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakdown.items.map((item, index) => (
              <div 
                key={index} 
                className={`rounded-lg p-3 ${
                  item.isHighlight 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 truncate" title={item.label}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.sublabel ? (
                    item.sublabel
                  ) : item.count !== undefined && item.amount !== undefined ? (
                    `${item.count}件 - ${item.amount.toLocaleString()}円${item.extra ? ` - ${item.extra}` : ''}`
                  ) : (
                    item.extra || ''
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
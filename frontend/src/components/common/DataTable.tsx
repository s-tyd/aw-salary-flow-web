'use client';

import React from 'react';
import { TableColumn } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';
import NoDataMessage from '../NoDataMessage';

export interface DataTableAction<T> {
  label: string;
  onClick: (item: T) => void;
  className?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  title?: string;
  actions?: DataTableAction<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * 汎用データテーブルコンポーネント
 * データ表示、ローディング状態、空状態、アクション機能を統合
 */
export default function DataTable<T extends { id: number | string }>({
  data,
  columns,
  loading = false,
  title,
  actions = [],
  emptyTitle = "データがありません",
  emptyDescription = "表示するデータがありません",
  className = "",
  headerActions,
}: DataTableProps<T>) {
  
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {title} (0件)
            </h2>
            {headerActions}
          </div>
        )}
        <NoDataMessage 
          title={emptyTitle} 
          description={emptyDescription}
          showNavigateButton={false}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {title} ({data.length}件)
          </h2>
          {headerActions}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '-')
                    }
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(item)}
                          className={action.className || "px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"}
                        >
                          {action.icon && (
                            <action.icon size={16} className="inline mr-1" />
                          )}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
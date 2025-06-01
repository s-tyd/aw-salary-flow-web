"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useDate } from "@/contexts/DateContext";
import { useState, useEffect } from "react";
import { TransportationExpense } from "@/lib/types";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { Search, Download, Filter } from "lucide-react";

export default function TransportationPage() {
  const { user, loading } = useAuthGuard();
  const { currentYear, currentMonth } = useDate();
  const [expenses, setExpenses] = useState<TransportationExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<
    TransportationExpense[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 初期化
  useEffect(() => {
    setExpenses([]);
    setFilteredExpenses([]);
    setIsLoading(false);
  }, []);

  // 検索フィルター
  useEffect(() => {
    const filtered = expenses.filter(
      (expense) =>
        expense.employee_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        expense.employee_number.includes(searchTerm),
    );
    setFilteredExpenses(filtered);
  }, [searchTerm, expenses]);

  // 合計計算
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.total_amount,
    0,
  );
  const totalUsageCount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.usage_count,
    0,
  );
  const totalTransportationExpense = filteredExpenses.reduce(
    (sum, expense) => sum + expense.transportation_expense,
    0,
  );

  const handleExport = () => {
    alert("CSV出力機能（実装予定）");
  };

  if (loading || isLoading) {
    return (
      <ProtectedLayout currentPath="/transportation" title="Kincone交通費" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedLayout currentPath="/transportation" title="Kincone交通費">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* ヘッダー部分 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentYear}年{currentMonth}月の交通費データ
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Kinconeから取得した交通費の集計データ
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Download size={16} />
                <span>CSV出力</span>
              </button>
            </div>
          </div>
        </div>

        {/* フィルター・検索部分 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="従業員名または従業員番号で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredExpenses.length}人
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                対象従業員数
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalUsageCount}回
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                総利用回数
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ¥{totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                合計交通費
              </div>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">従業員番号</th>
                <th className="px-6 py-3">従業員名</th>
                <th className="px-6 py-3">集計開始日</th>
                <th className="px-6 py-3">集計終了日</th>
                <th className="px-6 py-3 text-right">利用件数</th>
                <th className="px-6 py-3 text-right">交通費</th>
                <th className="px-6 py-3 text-right">通勤費</th>
                <th className="px-6 py-3 text-right">総額</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.employee_number}
                  className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {expense.employee_number}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                    {expense.employee_name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {new Date(expense.period_start).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {new Date(expense.period_end).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                    {expense.usage_count}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                    ¥{expense.transportation_expense.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                    ¥{expense.commute_expense.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                    ¥{expense.total_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* データが見つからない場合 */}
        {filteredExpenses.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Filter className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                データが見つかりません
              </h3>
              <p>検索条件を変更してお試しください。</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

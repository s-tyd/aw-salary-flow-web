"use client";

import { useDate } from "@/contexts/DateContext";
import { useCalculationPeriods } from "@/hooks/useCalculationPeriods";
import { useRouter, usePathname } from "next/navigation";

interface DateSelectorProps {
  isCollapsed: boolean;
}

export default function DateSelector({ isCollapsed }: DateSelectorProps) {
  const { currentYear, currentMonth, setYear, setMonth } = useDate();
  const { checkPeriod } = useCalculationPeriods();
  const router = useRouter();
  const pathname = usePathname();

  // 月変更時の処理
  const handleDateChange = async (newYear: number, newMonth: number) => {
    // 年月を更新
    if (newYear !== currentYear) setYear(newYear);
    if (newMonth !== currentMonth) setMonth(newMonth);

    // 計算期間の存在チェック
    try {
      const periodCheck = await checkPeriod(newYear, newMonth);
      
      // 計算が開始されていない場合はダッシュボードに遷移
      const isCalculationStarted = periodCheck?.exists && 
                                  periodCheck?.status && 
                                  periodCheck.status !== "draft";
      
      if (!isCalculationStarted && pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    } catch (error) {
      console.warn("計算期間チェックエラー:", error);
      // エラー時もダッシュボードに遷移
      if (pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    }
  };

  if (isCollapsed) return null;

  return (
    <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        対象年月
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            年
          </label>
          <select
            value={currentYear}
            onChange={(e) => handleDateChange(Number(e.target.value), currentMonth)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            月
          </label>
          <select
            value={currentMonth}
            onChange={(e) => handleDateChange(currentYear, Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}月
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

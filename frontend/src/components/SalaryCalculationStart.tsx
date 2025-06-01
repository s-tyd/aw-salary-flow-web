"use client";

import { useRouter } from "next/navigation";
import { useDate } from "@/contexts/DateContext";

interface SalaryCalculationStartProps {
  pageTitle: string;
  pageDescription: string;
}

export default function SalaryCalculationStart({
  pageTitle,
  pageDescription,
}: SalaryCalculationStartProps) {
  const router = useRouter();
  const { currentYear, currentMonth } = useDate();

  const handleNavigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* メインカード */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {pageDescription}
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="p-6">
            <div className="text-center space-y-6">
              {/* アイコン */}
              <div className="w-20 h-20 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* メッセージ */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  給与計算が開始されていません
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {currentYear}年{currentMonth}月の給与計算期間がまだ開始されていません。<br />
                  このページの機能を利用するには、まずダッシュボードから給与計算を開始してください。
                </p>
              </div>

              {/* 対象期間 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  対象期間
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {currentYear}年{currentMonth}月
                </p>
              </div>

              {/* ダッシュボードへのナビゲーションボタン */}
              <button
                onClick={handleNavigateToDashboard}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z"
                  />
                </svg>
                ダッシュボードへ移動
              </button>

              {/* 補足説明 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ※ 給与計算を開始すると、勤務データの入力や各種レポートの管理が可能になります
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
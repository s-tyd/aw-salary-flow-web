"use client";

import { useRouter } from "next/navigation";
import { useDate } from "@/contexts/DateContext";

interface NoDataMessageProps {
  title: string;
  description?: string;
  showNavigateButton?: boolean;
}

export default function NoDataMessage({
  title,
  description = "この期間のデータがまだありません。",
  showNavigateButton = true,
}: NoDataMessageProps) {
  const router = useRouter();
  const { currentYear, currentMonth } = useDate();

  const handleNavigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            対象期間: {currentYear}年{currentMonth}月
          </p>
        </div>

        {showNavigateButton && (
          <button
            onClick={handleNavigateToDashboard}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            この月の計算を開始
          </button>
        )}
      </div>
    </div>
  );
}

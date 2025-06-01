interface HomeCardProps {
  title: string;
  subtitle: string;
  status: boolean; // true = 未アップロード, false = アップロード済み
  toggle?: boolean;
  complete?: number;
  total?: number;
  onTap?: () => void;
  detailButtonOnTap?: () => void;
  detailButtonDescription?: string;
}

export default function HomeCard({
  title,
  subtitle,
  status,
  toggle,
  complete,
  total,
  onTap,
  detailButtonOnTap,
  detailButtonDescription,
}: HomeCardProps) {
  // status: true = 未読み込み（読み込みボタン）, false = 読み込み済み（更新ボタン）
  const uploadStatus = status
    ? {
        name: "読み込み",
        buttonColor: "bg-blue-600",
      }
    : {
        name: "更新",
        buttonColor: "bg-green-600",
      };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full">
      {/* ヘッダー */}
      <div className="p-3 lg:p-4">
        <h3 className="font-bold text-sm lg:text-base text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>

      {/* 区切り線 */}
      <div className="h-px bg-gray-300 mx-2"></div>

      {/* コンテンツ */}
      <div className="p-3 lg:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <p className="text-gray-500 text-xs lg:text-sm font-medium flex-1">
            {subtitle}
          </p>

          <div className="flex items-center gap-2 sm:flex-shrink-0">
            {/* 進捗表示 */}
            {complete !== undefined &&
              total !== undefined &&
              total !== 1 &&
              complete !== 1 && (
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {complete}/{total}
                </span>
              )}

            {/* 詳細ボタン */}
            {detailButtonOnTap && (
              <button
                onClick={detailButtonOnTap}
                className="w-12 lg:w-14 h-8 text-xs lg:text-sm text-white border border-gray-300 rounded bg-gray-500 hover:bg-gray-600 transition-colors"
              >
                詳細
              </button>
            )}

            {/* メインボタン */}
            <button
              onClick={onTap}
              className={`w-12 lg:w-14 h-8 text-xs lg:text-sm text-white rounded hover:opacity-90 transition-opacity ${uploadStatus.buttonColor}`}
            >
              {uploadStatus.name}
            </button>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mt-3">
          {toggle !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: toggle ? "100%" : "0%" }}
              ></div>
            </div>
          )}

          {complete !== undefined && total !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: total > 0 ? `${(complete / total) * 100}%` : "0%",
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

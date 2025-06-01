"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDate } from "@/contexts/DateContext";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import HomeCard from "@/components/HomeCard";
import PageTransition from "@/components/PageTransition";
import { useCalculationPeriods } from "@/hooks/useCalculationPeriods";
import { CalculationPeriodCheck, DashboardEmployee } from "@/lib/types";
import { withAuthGuard } from "@/components/hoc/withAuthGuard";

function Dashboard() {
  const { user, logout } = useAuth();
  const { currentYear, currentMonth } = useDate();
  const { checkPeriod, startSalaryCalculation } = useCalculationPeriods();

  // データ状態 - すべて空/未設定の状態で初期化
  const [employees, setEmployees] = useState<DashboardEmployee[]>([]);
  const [exitTemplateFile, setExitTemplateFile] = useState(false);
  const [periodCheck, setPeriodCheck] = useState<CalculationPeriodCheck | null>(
    null,
  );
  const [isStarting, setIsStarting] = useState(false);

  // 計算期間の存在チェック
  useEffect(() => {
    const checkCurrentPeriod = async () => {
      if (user) {
        try {
          const check = await checkPeriod(currentYear, currentMonth);
          setPeriodCheck(check);
        } catch (err) {
          console.warn("計算期間チェックエラー:", err);
          setPeriodCheck({
            exists: false,
            status: null,
            can_start_calculation: true,
          });
        }
      }
    };

    checkCurrentPeriod();
  }, [user, currentYear, currentMonth]);

  const handleStartCalculation = async () => {
    try {
      setIsStarting(true);
      await startSalaryCalculation(currentYear, currentMonth);
      // 計算期間チェックを再実行
      const check = await checkPeriod(currentYear, currentMonth);
      setPeriodCheck(check);

      // サイドバーに計算開始を通知
      window.dispatchEvent(new CustomEvent("calculationStarted"));

      alert(`${currentYear}年${currentMonth}月の給与計算を開始しました！`);
    } catch (err: any) {
      alert(
        `給与計算開始エラー: ${err.message || "不明なエラーが発生しました"}`,
      );
    } finally {
      setIsStarting(false);
    }
  };


  if (!user) {
    return null;
  }

  // データ集計
  const requireApproval = employees.filter((emp) => emp.workData != null);
  const approval = employees.filter((emp) => emp.approved === true);
  const nameKeys = employees.filter((emp) => emp.nameKeys != null);
  const kiwiScoreReports = employees.filter(
    (emp) => emp.kiwiScoreReport != null,
  );
  const expenses = employees.filter(
    (emp) => emp.transportationExpenses != null,
  );
  const freeeExpenses = employees.filter((emp) => emp.freeeExpenses != null);

  // 完了カウンター
  const getProgressCount = () => {
    let count = 0;
    if (requireApproval.length > 0) count += 1;
    if (approval.length > 0 && approval.length === requireApproval.length)
      count += 1;
    if (nameKeys.length > 0) count += 1;
    if (kiwiScoreReports.length > 0) count += 1;
    if (expenses.length > 0) count += 1;
    if (freeeExpenses.length > 0) count += 1;
    if (exitTemplateFile) count += 1;
    return { current: count, total: 6 };
  };

  const progress = getProgressCount();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath="/dashboard" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className="p-4 lg:p-6 max-w-7xl mx-auto">
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  ダッシュボード
                </h1>
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {currentYear}年{currentMonth}月の給与計算
                  {periodCheck && (
                    <span
                      className={`block font-medium mt-1 ${
                        !periodCheck.exists
                          ? "text-orange-600 dark:text-orange-400"
                          : periodCheck.status === "calculating"
                            ? "text-blue-600 dark:text-blue-400"
                            : periodCheck.status === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {!periodCheck.exists
                        ? "この月の計算を開始してください"
                        : periodCheck.status === "calculating"
                          ? "計算中..."
                          : periodCheck.status === "completed"
                            ? "計算完了"
                            : periodCheck.status === "locked"
                              ? "ロック済み"
                              : "ドラフト状態"}
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4 lg:space-y-6">
                {(() => {
                  // 計算期間が存在しない、または計算開始可能な状態の場合に開始ボタンを表示
                  if (!periodCheck || periodCheck.can_start_calculation) {
                    return (
                      <div className="min-h-[60vh] flex items-center justify-center">
                        <div className="text-center space-y-6 max-w-md mx-auto">
                          <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <svg
                              className="w-10 h-10 text-blue-600 dark:text-blue-400"
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

                          <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {currentYear}年{currentMonth}月の給与計算
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                              この期間の給与計算をまだ開始していません。
                              <br />
                              必要なデータをアップロードして計算を開始しましょう。
                            </p>
                          </div>

                          <button
                            onClick={handleStartCalculation}
                            disabled={isStarting}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
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
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            {isStarting
                              ? "開始中..."
                              : "この月の給与計算を開始"}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* 6つのカードを3列2行で配置 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        <HomeCard
                          title="1.社員情報"
                          subtitle="社員番号、氏名、各ファイルの氏名が入ったExcelを登録"
                          status={nameKeys.length === 0}
                          toggle={nameKeys.length > 0}
                          onTap={() => {
                            alert("社員情報のアップロード機能（実装予定）");
                          }}
                        />
                        <HomeCard
                          title="2.勤務データ"
                          subtitle="Kinconeの一括ダウンロードから勤務表の集計CSVを読み込み"
                          status={requireApproval.length === 0}
                          toggle={requireApproval.length > 0}
                          onTap={() => {
                            alert("勤務データのCSV読み込み機能（実装予定）");
                          }}
                          detailButtonOnTap={() => {
                            window.open(
                              "https://kincone.com/download",
                              "_blank",
                            );
                          }}
                        />
                        <HomeCard
                          title="3.KiwiGo スコアレポート"
                          subtitle="KiwiGoからダウンロードしたスコアレポートのCSVを読み込み"
                          status={kiwiScoreReports.length === 0}
                          toggle={kiwiScoreReports.length > 0}
                          onTap={() => {
                            alert(
                              "KiwiGoレポートのCSV読み込み機能（実装予定）",
                            );
                          }}
                        />
                        <HomeCard
                          title="3.Kincone 交通費"
                          subtitle="Kinconeの一括ダウンロードから交通費の集計CSVを読み込み"
                          status={expenses.length === 0}
                          toggle={expenses.length > 0}
                          onTap={() => {
                            alert("交通費のCSV読み込み機能（実装予定）");
                          }}
                        />
                        <HomeCard
                          title="3.Freee 経費精算"
                          subtitle="FreeeからダウンロードしたCSVを読み込み"
                          status={freeeExpenses.length === 0}
                          toggle={freeeExpenses.length > 0}
                          onTap={() => {
                            alert("Freee経費のCSV読み込み機能（実装予定）");
                          }}
                        />
                        <HomeCard
                          title="4.テンプレートExcel"
                          subtitle="生成に使用するテンプレートのエクセルです"
                          status={!exitTemplateFile}
                          toggle={exitTemplateFile}
                          onTap={() => {
                            alert(
                              "テンプレートExcelのアップロード機能（実装予定）",
                            );
                          }}
                        />
                      </div>

                      {/* アップロード状況 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
                        <div className="text-center space-y-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            アップロード状況
                          </h3>
                          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {progress.current}/{progress.total}
                          </div>
                          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
                            必要なファイルがアップロードされています
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(progress.current / progress.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* 給与計算開始ボタン */}
                      <button
                        onClick={handleStartCalculation}
                        disabled={isStarting}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 lg:py-4 px-4 lg:px-6 rounded-lg text-base lg:text-lg transition-colors disabled:cursor-not-allowed"
                      >
                        {isStarting ? "開始中..." : "給与計算を開始"}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}

export default withAuthGuard(Dashboard);

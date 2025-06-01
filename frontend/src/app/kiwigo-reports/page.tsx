'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useDate } from '@/contexts/DateContext';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import DataStatusIndicator from '@/components/DataStatusIndicator';
import NoDataMessage from '@/components/NoDataMessage';
import { useCalculationPeriods } from '@/hooks/useCalculationPeriods';
import SalaryCalculationStart from '@/components/SalaryCalculationStart';

interface KiwiGoReport {
  id: number;
  employee_id: number;
  employee_name: string;
  report_date: string;
  score: number;
  activity_hours: number;
  steps: number;
  distance: number;
  calories_burned: number;
  goals_achieved: number;
  total_goals: number;
  created_at: string;
}

export default function KiwiGoReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { currentYear, currentMonth } = useDate();
  const { checkPeriod } = useCalculationPeriods();
  const [reports, setReports] = useState<KiwiGoReport[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [hasRealData, setHasRealData] = useState<boolean>(false);
  const [periodCheck, setPeriodCheck] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 計算期間の存在チェック
  useEffect(() => {
    const checkCurrentPeriod = async () => {
      if (user) {
        try {
          const check = await checkPeriod(currentYear, currentMonth);
          setPeriodCheck(check);
        } catch (err) {
          console.warn('計算期間チェックエラー:', err);
          setPeriodCheck({ exists: false, status: null, started: false });
        }
      }
    };
    checkCurrentPeriod();
  }, [user, currentYear, currentMonth, checkPeriod]);

  // データ取得（実際のAPIから取得する想定）
  useEffect(() => {
    // TODO: 実際のAPIからデータを取得する処理を実装
    setHasRealData(false);
    setReports([]);
  }, [currentYear, currentMonth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredReports = reports.filter(report => {
    if (selectedEmployee !== 'all' && report.employee_name !== selectedEmployee) {
      return false;
    }
    return true;
  });

  const employees = [...new Set(reports.map(report => report.employee_name))];
  
  const averageScore = filteredReports.length > 0 
    ? Math.round(filteredReports.reduce((sum, report) => sum + report.score, 0) / filteredReports.length)
    : 0;
  
  const totalSteps = filteredReports.reduce((sum, report) => sum + report.steps, 0);
  const totalDistance = filteredReports.reduce((sum, report) => sum + report.distance, 0);
  const totalCalories = filteredReports.reduce((sum, report) => sum + report.calories_burned, 0);

  const handleFileUpload = () => {
    alert('KiwiGoスコアレポートのアップロード機能（実装予定）');
    setShowUploadForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath="/kiwigo-reports" />
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className="p-6">
              {/* 給与計算が開始されていない場合の表示 */}
              {!periodCheck?.exists || !periodCheck?.status || periodCheck?.status === 'draft' ? (
                <SalaryCalculationStart 
                  pageTitle="KiwiGoレポート"
                  pageDescription="従業員の健康データの管理"
                />
              ) : (
                <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                  <div className="mb-6 lg:mb-8">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">KiwiGoスコアレポート</h1>
                      <DataStatusIndicator hasData={hasRealData} />
                    </div>
                    <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mt-2">
                      {currentYear}年{currentMonth}月の健康活動データ
                    </p>
                  </div>

                  <div className="space-y-4 lg:space-y-6">
                    {/* データがない場合の表示 */}
                    {!hasRealData ? (
                      <NoDataMessage 
                        title="KiwiGoレポートがありません"
                        description="この期間のKiwiGoスコアレポートがまだ登録されていません。ダッシュボードから給与計算を開始してください。"
                      />
                    ) : (
                      <>
                        {/* アップロードボタン */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">データ管理</h2>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">KiwiGoからダウンロードしたスコアレポートをアップロード</p>
                            </div>
                            <button
                              onClick={() => setShowUploadForm(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                            >
                              レポートをアップロード
                            </button>
                          </div>
                        </div>

                        {/* 統計サマリー */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">平均スコア</h3>
                            <p className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                              {averageScore}点
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">総歩数</h3>
                            <p className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                              {totalSteps.toLocaleString()}歩
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">総距離</h3>
                            <p className="text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                              {totalDistance.toFixed(1)}km
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">総消費カロリー</h3>
                            <p className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                              {totalCalories}kcal
                            </p>
                          </div>
                        </div>

                        {/* フィルター */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
                          <div className="flex flex-wrap gap-4 items-center">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                従業員
                              </label>
                              <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                <option value="all">全員</option>
                                {employees.map(name => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => alert('CSVエクスポート機能（実装予定）')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                              >
                                CSVエクスポート
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* レポート一覧 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">スコアレポート一覧</h2>
                          </div>
                          <div className="p-4 lg:p-6">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                  <tr>
                                    <th className="px-6 py-3">日付</th>
                                    <th className="px-6 py-3">従業員名</th>
                                    <th className="px-6 py-3">スコア</th>
                                    <th className="px-6 py-3">活動時間</th>
                                    <th className="px-6 py-3">歩数</th>
                                    <th className="px-6 py-3">距離</th>
                                    <th className="px-6 py-3">消費カロリー</th>
                                    <th className="px-6 py-3">目標達成</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredReports.map((report) => (
                                    <tr
                                      key={report.id}
                                      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                        {new Date(report.report_date).toLocaleDateString('ja-JP')}
                                      </td>
                                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                        {report.employee_name}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          report.score >= 90 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : report.score >= 80
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                            : report.score >= 70
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                          {report.score}点
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {report.activity_hours}時間
                                      </td>
                                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {report.steps.toLocaleString()}歩
                                      </td>
                                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {report.distance}km
                                      </td>
                                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {report.calories_burned}kcal
                                      </td>
                                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {report.goals_achieved}/{report.total_goals}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </PageTransition>
        </div>
      </div>

      {/* アップロードモーダル */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              KiwiGoスコアレポートのアップロード
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              KiwiGoからダウンロードしたCSVファイルを選択してください。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleFileUpload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                ファイル選択
              </button>
              <button
                onClick={() => setShowUploadForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";

interface MonthlyReport {
  month: string;
  totalEmployees: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalExpenses: number;
  avgWorkHoursPerEmployee: number;
}

interface EmployeeReport {
  name: string;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalExpenses: number;
  attendanceDays: number;
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportType, setReportType] = useState<"monthly" | "employee">(
    "monthly",
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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

  // データを空の状態に設定
  const monthlyReports: MonthlyReport[] = [];
  const employeeReports: EmployeeReport[] = [];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath="/reports" />

      <div className="flex-1 overflow-y-auto">
        <PageTransition>
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  レポート
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  勤務データと経費の集計レポート
                </p>
              </div>

              {/* コントロールパネル */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      年
                    </label>
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value={2023}>2023</option>
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>

                  {reportType === "employee" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        月
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) =>
                          setSelectedMonth(Number(e.target.value))
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <option key={month} value={month}>
                              {month}月
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      レポート種別
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) =>
                        setReportType(e.target.value as "monthly" | "employee")
                      }
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="monthly">月次レポート</option>
                      <option value="employee">従業員別レポート</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => alert("PDFエクスポート機能（実装予定）")}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium mr-2"
                    >
                      PDF出力
                    </button>
                    <button
                      onClick={() => alert("Excelエクスポート機能（実装予定）")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Excel出力
                    </button>
                  </div>
                </div>
              </div>

              {/* レポート内容 */}
              <div className="p-6">
                {reportType === "monthly" ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                      {currentYear}年 月次レポート
                    </h2>

                    {/* 月次サマリーカード */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                          総従業員数
                        </h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                          0人
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                          今月の総勤務時間
                        </h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-300 mt-2">
                          0h
                        </p>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100">
                          今月の総残業時間
                        </h3>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-300 mt-2">
                          0h
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100">
                          今月の総経費
                        </h3>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mt-2">
                          ¥0
                        </p>
                      </div>
                    </div>

                    {/* 月次データテーブル */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3">月</th>
                            <th className="px-6 py-3">従業員数</th>
                            <th className="px-6 py-3">総勤務時間</th>
                            <th className="px-6 py-3">総残業時間</th>
                            <th className="px-6 py-3">総経費</th>
                            <th className="px-6 py-3">従業員平均勤務時間</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyReports.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                月次レポートデータがありません
                              </td>
                            </tr>
                          ) : (
                            monthlyReports.map((report) => (
                              <tr
                                key={report.month}
                                className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                  {new Date(report.month).toLocaleDateString(
                                    "ja-JP",
                                    { year: "numeric", month: "long" },
                                  )}
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  {report.totalEmployees}人
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  {report.totalWorkHours}h
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  {report.totalOvertimeHours}h
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  ¥{report.totalExpenses.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  {report.avgWorkHoursPerEmployee}h
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                      {currentYear}年{selectedMonth}月 従業員別レポート
                    </h2>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3">従業員名</th>
                            <th className="px-6 py-3">勤務時間</th>
                            <th className="px-6 py-3">残業時間</th>
                            <th className="px-6 py-3">出勤日数</th>
                            <th className="px-6 py-3">経費</th>
                            <th className="px-6 py-3">時間単価（仮）</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeReports.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                従業員別レポートデータがありません
                              </td>
                            </tr>
                          ) : (
                            employeeReports.map((report) => (
                              <tr
                                key={report.name}
                                className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                  {report.name}
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  {report.totalWorkHours}h
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  {report.totalOvertimeHours}h
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  {report.attendanceDays}日
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  ¥{report.totalExpenses.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                  ¥
                                  {Math.round(
                                    report.totalExpenses /
                                      report.totalWorkHours || 0,
                                  ).toLocaleString()}
                                  /h
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}

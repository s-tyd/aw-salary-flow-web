"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useDate } from "@/contexts/DateContext";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import DataStatusIndicator from "@/components/DataStatusIndicator";
import NoDataMessage from "@/components/NoDataMessage";

interface WorkData {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  break_time: number;
  work_hours: number;
  overtime_hours: number;
  status: "pending" | "approved" | "rejected";
  note?: string;
}

export default function WorkDataPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { currentYear, currentMonth } = useDate();
  const [workData, setWorkData] = useState<WorkData[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [hasRealData, setHasRealData] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // データ取得（実際のAPIから取得する想定）
  useEffect(() => {
    // 実際のデータを取得する処理を実装予定
    // 現在は常に空のデータを設定
    setHasRealData(false);
    setWorkData([]);
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

  const filteredData = workData.filter((item) => {
    if (selectedEmployee !== "all" && item.employee_name !== selectedEmployee) {
      return false;
    }
    if (selectedStatus !== "all" && item.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const employees = [...new Set(workData.map((item) => item.employee_name))];

  const updateStatus = (id: number, status: "approved" | "rejected") => {
    setWorkData(
      workData.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "承認済み";
      case "rejected":
        return "却下";
      default:
        return "承認待ち";
    }
  };

  const totalHours = filteredData.reduce(
    (sum, item) => sum + item.work_hours,
    0,
  );
  const totalOvertimeHours = filteredData.reduce(
    (sum, item) => sum + item.overtime_hours,
    0,
  );
  const pendingCount = filteredData.filter(
    (item) => item.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath="/work-data" />

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className="p-6">
              {/* 勤務データ管理画面 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        勤務データ管理
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {currentYear}年{currentMonth}月の勤務データを管理します
                      </p>
                    </div>

                    <DataStatusIndicator
                      hasData={hasRealData}
                      label="勤務データ"
                    />
                  </div>
                </div>

                {/* フィルター */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        社員名で絞り込み
                      </label>
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">すべての社員</option>
                        {employees.map((employee) => (
                          <option key={employee} value={employee}>
                            {employee}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        承認状況で絞り込み
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">すべての状況</option>
                        <option value="pending">承認待ち</option>
                        <option value="approved">承認済み</option>
                        <option value="rejected">却下</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 集計情報 */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {totalHours.toFixed(1)}h
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        総勤務時間
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {totalOvertimeHours.toFixed(1)}h
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        総残業時間
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {pendingCount}件
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        承認待ち
                      </div>
                    </div>
                  </div>
                </div>

                {/* データ表示 */}
                <div className="p-6">
                  {!hasRealData || filteredData.length === 0 ? (
                    <NoDataMessage
                      title="勤務データがありません"
                      description="Kinconeから勤務データをアップロードしてください"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              社員名
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              日付
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              出勤時刻
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              退勤時刻
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              休憩時間
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              勤務時間
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              残業時間
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              承認状況
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                                {item.employee_name}
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {item.date}
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {item.start_time}
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {item.end_time}
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {item.break_time}分
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {item.work_hours}h
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {item.overtime_hours}h
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                >
                                  {getStatusText(item.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {item.status === "pending" && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        updateStatus(item.id, "approved")
                                      }
                                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    >
                                      承認
                                    </button>
                                    <button
                                      onClick={() =>
                                        updateStatus(item.id, "rejected")
                                      }
                                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                      却下
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}

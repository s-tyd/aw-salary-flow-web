"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import { Employee } from "@/lib/types";

export default function EmployeesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);

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


  const handleDelete = (id: number) => {
    if (confirm("この従業員を削除しますか？")) {
      // TODO: 実際のAPI呼び出しを実装
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath="/employees" />

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className="p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    従業員管理
                  </h1>
                </div>


                {/* 従業員一覧 */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3">従業員番号</th>
                          <th className="px-6 py-3">氏名</th>
                          <th className="px-6 py-3">Kiwi名</th>
                          <th className="px-6 py-3">入社日</th>
                          <th className="px-6 py-3">ステータス</th>
                          <th className="px-6 py-3">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                            >
                              従業員データがありません
                            </td>
                          </tr>
                        ) : (
                          employees.map((employee) => (
                            <tr
                              key={employee.id}
                              className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                {employee.employee_number}
                              </td>
                              <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                {employee.name}
                              </td>
                              <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                {employee.kiwi_name || "-"}
                              </td>
                              <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                {new Date(
                                  employee.hire_date,
                                ).toLocaleDateString("ja-JP")}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    employee.resignation_date
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  }`}
                                >
                                  {employee.resignation_date ? "退職" : "在職"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() =>
                                      alert(
                                        `${employee.name}の編集機能（実装予定）`,
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                  >
                                    編集
                                  </button>
                                  <button
                                    onClick={() => handleDelete(employee.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                  >
                                    削除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}

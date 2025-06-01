"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeCreate, EmployeeUpdate } from "@/lib/types";

export default function EmployeeMasterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    employees,
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResigned, setShowResigned] = useState(false);
  const [showNameFields, setShowNameFields] = useState(false);
  const [showTableNameColumns, setShowTableNameColumns] = useState(false);
  const [formData, setFormData] = useState({
    employee_number: "",
    name: "",
    hire_date: "",
    resignation_date: "",
    kiwi_name: "",
    remote_allowance: false,
  });

  // 認証チェック
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      employee_number: "",
      name: "",
      hire_date: "",
      resignation_date: "",
      kiwi_name: "",
      remote_allowance: false,
    });
    setEditingEmployee(null);
    setShowForm(false);
    setFormError(null);
    setShowNameFields(false);
  };

  // 新規追加フォームを開く
  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // 編集フォームを開く
  const handleEdit = (employee: any) => {
    setFormData({
      employee_number: employee.employee_number,
      name: employee.name,
      hire_date: employee.hire_date,
      resignation_date: employee.resignation_date || "",
      kiwi_name: employee.kiwi_name || "",
      remote_allowance: employee.remote_allowance || false,
    });
    setEditingEmployee(employee);
    setShowForm(true);
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // バリデーション
    if (!formData.employee_number.trim() || !formData.name.trim()) {
      setFormError("社員番号と氏名は必須項目です。");
      return;
    }

    try {
      if (editingEmployee) {
        // 更新
        await updateEmployee(editingEmployee.id, formData);
      } else {
        // 新規作成
        await createEmployee(formData);
      }
      resetForm();
    } catch (error: any) {
      console.error("社員データ操作エラー:", error);
      setFormError(error.message || "操作中にエラーが発生しました。");
    }
  };

  // 削除
  const handleDelete = async (employee: any) => {
    if (!confirm(`${employee.name}さんを削除しますか？`)) {
      return;
    }

    try {
      await deleteEmployee(employee.id);
    } catch (error: any) {
      console.error("削除エラー:", error);
      alert("削除中にエラーが発生しました。");
    }
  };

  // 検索・フィルタリング
  const filteredEmployees = employees.filter((employee) => {
    // 退職済み社員の表示フィルター
    const isResigned =
      employee.resignation_date &&
      new Date(employee.resignation_date) <= new Date();
    if (!showResigned && isResigned) {
      return false;
    }

    // 検索フィルター
    return (
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (employee.kiwi_name &&
        employee.kiwi_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar currentPath="/employee-master" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
              {/* 社員管理画面 */}
              {/* ヘッダー */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    社員マスタデータ管理
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    社員の基本情報を管理します
                  </p>
                </div>
                <button
                  onClick={handleAddNew}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>新しい社員</span>
                </button>
              </div>

              {/* 検索バー */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="社員番号、氏名、Kiwi氏名で検索..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* フォーム */}
              {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    {editingEmployee ? "社員情報編集" : "新しい社員の追加"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          社員番号 *
                        </label>
                        <input
                          type="text"
                          value={formData.employee_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employee_number: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="例: EMP001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          氏名 *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="例: 田中太郎"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          入社日
                        </label>
                        <input
                          type="date"
                          value={formData.hire_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hire_date: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          退職日
                        </label>
                        <input
                          type="date"
                          value={formData.resignation_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              resignation_date: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    {/* Kiwi名フィールドの折りたたみセクション */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-md">
                      <button
                        type="button"
                        onClick={() => setShowNameFields(!showNameFields)}
                        className="w-full flex items-center justify-between p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Kiwi 名前設定
                        </span>
                        {showNameFields ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </button>
                      {showNameFields && (
                        <div className="p-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Kiwi氏名
                            </label>
                            <input
                              type="text"
                              value={formData.kiwi_name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  kiwi_name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="例: T.Tanaka"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* リモート手当のチェックボックス */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remote_allowance"
                        checked={formData.remote_allowance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            remote_allowance: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="remote_allowance"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        リモート手当
                      </label>
                    </div>
                    {formError && (
                      <div className="text-red-600 dark:text-red-400 text-sm">
                        {formError}
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <UserCheck size={18} />
                        <span>{editingEmployee ? "更新" : "追加"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 社員一覧 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      社員一覧 ({filteredEmployees.length}名)
                    </h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showKiwiNames"
                          checked={showTableNameColumns}
                          onChange={(e) => setShowTableNameColumns(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="showKiwiNames"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Kiwi氏名を表示
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showResignedInList"
                          checked={showResigned}
                          onChange={(e) => setShowResigned(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="showResignedInList"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          退職済みの社員を表示
                        </label>
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        読み込み中...
                      </div>
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck
                        size={48}
                        className="mx-auto text-gray-400 mb-3"
                      />
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm
                          ? "検索条件に一致する社員が見つかりません"
                          : "社員がまだ登録されていません"}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              <div className="leading-tight">
                                社員
                                <br />
                                番号
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              氏名
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              入社日
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              退職日
                            </th>
                            {showTableNameColumns && (
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100 text-xs">
                                Kiwi氏名
                              </th>
                            )}
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              リモート手当
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployees.map((employee) => (
                            <tr
                              key={employee.id}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                                {employee.employee_number}
                              </td>
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                                {employee.name}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {employee.hire_date
                                  ? new Date(
                                      employee.hire_date,
                                    ).toLocaleDateString("ja-JP")
                                  : "-"}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {employee.resignation_date
                                  ? new Date(
                                      employee.resignation_date,
                                    ).toLocaleDateString("ja-JP")
                                  : "-"}
                              </td>
                              {showTableNameColumns && (
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                                  {employee.kiwi_name || "-"}
                                </td>
                              )}
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {employee.remote_allowance ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    あり
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                    なし
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEdit(employee)}
                                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                                    title="編集"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(employee)}
                                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                    title="削除"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
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

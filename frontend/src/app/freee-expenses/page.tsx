'use client';

import { useState, useMemo } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FileUpload from '@/components/common/FileUpload';
import NoDataMessage from '@/components/NoDataMessage';
import CsvPreview from '@/components/common/CsvPreview';
import DataSummary, { SummaryItem } from '@/components/common/DataSummary';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useFreeeExpenses } from '@/hooks/useFreeeExpenses';
import { FreeeExpenseImportResponse, FreeeExpense } from '@/services/FreeeExpenseService';
import { ImportResult } from '@/services/CsvImportService';
import { formatCurrency, formatDate, extractEmployeeName } from '@/utils/formatters';

type ImportStep = 'upload' | 'preview' | 'importing' | 'completed';

export default function FreeeExpensesPage() {
  const filters = useMemo(() => ({}), []); // 空のフィルターを固定
  const { expenses, loading, error, parseCsv, importCsv, deleteAllExpenses } = useFreeeExpenses(filters);
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvParseResult, setCsvParseResult] = useState<ImportResult<Partial<FreeeExpense>> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<FreeeExpenseImportResponse | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setStep('preview');
    setOriginalFile(file); // 元のファイルを保存

    try {
      const parseResult = await parseCsv(file);
      setCsvParseResult(parseResult);
    } catch (error) {
      console.error('CSV解析エラー:', error);
      setStep('upload');
      setOriginalFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleImportConfirm = async (data: Partial<FreeeExpense>[]) => {
    if (!originalFile) {
      console.error('元のファイルが見つかりません');
      return;
    }

    setStep('importing');
    setImportResult(null);

    try {
      // 元のファイルをサーバーに送信してインポート
      const result = await importCsv(originalFile, 1);
      setImportResult(result);
      setStep('completed');
    } catch (error) {
      console.error('CSVインポートエラー:', error);
      setImportResult({
        imported_count: 0,
        errors: [error instanceof Error ? error.message : 'インポートに失敗しました'],
        success: false,
      });
      setStep('completed');
    }
  };

  const handleImportCancel = () => {
    setStep('upload');
    setCsvParseResult(null);
    setOriginalFile(null);
  };

  const resetImport = () => {
    setStep('upload');
    setCsvParseResult(null);
    setImportResult(null);
    setOriginalFile(null);
  };

  const handleDeleteAllData = async () => {
    if (!confirm('全ての経費データを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const result = await deleteAllExpenses();
      alert(result.message);
      setStep('upload'); // アップロード画面に戻す
    } catch (error) {
      console.error('データ削除エラー:', error);
      alert('データの削除に失敗しました');
    }
  };

  // サマリーデータの計算
  const summaryItems: SummaryItem[] = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const totalAmount = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    const totalTax = expenses.reduce((sum, expense) => sum + (Number(expense.tax_amount) || 0), 0);
    const uniqueEmployees = new Set(expenses.map(expense => expense.employee_number).filter(Boolean)).size;
    const uniqueAccounts = new Set(expenses.map(expense => expense.account_item)).size;

    return [
      { label: '総件数', value: expenses.length, color: 'blue' },
      { label: '総金額', value: formatCurrency(totalAmount), color: 'green' },
      { label: '総税額', value: formatCurrency(totalTax), color: 'purple' },
      { label: '経費申請者数', value: `${uniqueEmployees}名`, color: 'orange' },
      { label: '勘定科目数', value: `${uniqueAccounts}科目`, color: 'indigo' }
    ];
  }, [expenses]);

  // 勘定科目別ランキングの計算
  const accountRanking = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const accountData = expenses.reduce((acc, expense) => {
      const account = expense.account_item;
      if (!acc[account]) {
        acc[account] = { count: 0, amount: 0 };
      }
      acc[account].count += 1;
      acc[account].amount += (Number(expense.amount) || 0);
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(accountData)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 6)
      .map(([account, data], index) => {
        const isTop3 = index < 3;
        const rankColors = ['🥇', '🥈', '🥉'];
        
        return {
          label: `${isTop3 ? rankColors[index] : `${index + 1}.`} ${account}`,
          count: data.count,
          amount: data.amount,
          isHighlight: isTop3
        };
      });
  }, [expenses]);


  return (
    <ProtectedLayout currentPath="/freee-expenses">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Freee経費</h1>
          <p className="text-gray-600">
            Freeeから出力した経費CSVファイルをアップロードして管理できます
          </p>
        </div>

        {/* CSVアップロード・プレビュー */}
        {step === 'upload' && (!expenses || expenses.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              CSVファイルのアップロード
            </h2>
            <FileUpload
              onFileSelect={handleFileUpload}
              accept=".csv"
              isLoading={uploading}
              title="経費CSVファイルをアップロード"
              description="Freeeから出力した経費CSVファイルを選択してください（Shift-JIS、UTF-8対応）"
            />
            {uploading && (
              <div className="mt-4 flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600">CSV解析中...</span>
              </div>
            )}
          </div>
        )}

        {/* CSVプレビュー */}
        {step === 'preview' && csvParseResult && (
          <div className="mb-6">
            <CsvPreview
              result={csvParseResult}
              onConfirm={handleImportConfirm}
              onCancel={handleImportCancel}
            />
          </div>
        )}

        {/* インポート中 */}
        {step === 'importing' && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-3 text-lg text-gray-600">データをインポート中...</span>
            </div>
          </div>
        )}

        {/* インポート結果の表示 */}
        {step === 'completed' && importResult && (
          <div className={`rounded-lg p-4 mb-6 ${
            importResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold mb-2 ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  インポート結果
                </h3>
                {importResult.success ? (
                  <p className="text-green-700">
                    {importResult.imported_count}件のデータをインポートしました
                  </p>
                ) : (
                  <div className="text-red-700">
                    <p>インポートに失敗しました</p>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={resetImport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                新しいファイルをアップロード
              </button>
            </div>
          </div>
        )}

        {/* 経費データサマリ */}
        {expenses && expenses.length > 0 && (
          <DataSummary
            title="経費データサマリ"
            items={summaryItems}
            breakdown={accountRanking.length > 0 ? {
              title: "勘定科目別ランキング",
              description: "金額の多い順に表示",
              items: accountRanking
            } : undefined}
          />
        )}

        {/* 経費データテーブル */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              経費データ一覧 ({expenses?.length || 0}件)
            </h2>
            {expenses && expenses.length > 0 && (
              <button
                onClick={handleDeleteAllData}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                全データ削除
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : !expenses || expenses.length === 0 ? (
            <NoDataMessage 
              title="経費データがありません" 
              description="CSVファイルをアップロードしてデータを追加してください"
              showNavigateButton={false}
            />
          ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        発生日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        社員名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        勘定科目
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        品目
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金額
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        税額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        備考
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        支払日
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses?.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.occurrence_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {extractEmployeeName(expense.partner_name, expense.employee_number)}
                          </div>
                          {expense.employee_number && (
                            <div className="text-xs text-gray-500">
                              社員番号: {expense.employee_number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.account_item}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {expense.item_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(expense.tax_amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {expense.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.payment_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
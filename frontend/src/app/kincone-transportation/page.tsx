'use client';

import { useState, useMemo } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FileUpload from '@/components/common/FileUpload';
import NoDataMessage from '@/components/NoDataMessage';
import CsvPreview from '@/components/common/CsvPreview';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useKinconeTransportation } from '@/hooks/useKinconeTransportation';
import { KinconeTransportationImportResponse, KinconeTransportation } from '@/services/KinconeTransportationService';
import { ImportResult } from '@/services/CsvImportService';
import { formatCurrency, formatDate } from '@/utils/formatters';

type ImportStep = 'upload' | 'preview' | 'importing' | 'completed';

export default function KinconeTransportationPage() {
  const filters = useMemo(() => ({}), []); // 空のフィルターを固定
  const { transportation, loading, error, parseCsv, importCsv, deleteAllTransportation } = useKinconeTransportation(filters);
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvParseResult, setCsvParseResult] = useState<ImportResult<Partial<KinconeTransportation>> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<KinconeTransportationImportResponse | null>(null);
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

  const handleImportConfirm = async (data: Partial<KinconeTransportation>[]) => {
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
    if (!confirm('全ての交通費データを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const result = await deleteAllTransportation();
      alert(result.message);
      setStep('upload'); // アップロード画面に戻す
    } catch (error) {
      console.error('データ削除エラー:', error);
      alert('データの削除に失敗しました');
    }
  };

  return (
    <ProtectedLayout currentPath="/kincone-transportation">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kincone交通費</h1>
          <p className="text-gray-600">
            Kinconeから出力した交通費CSVファイルをアップロードして管理できます
          </p>
        </div>

        {/* CSVアップロード・プレビュー */}
        {step === 'upload' && (!transportation || transportation.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              CSVファイルのアップロード
            </h2>
            <FileUpload
              onFileSelect={handleFileUpload}
              accept=".csv"
              isLoading={uploading}
              title="交通費CSVファイルをアップロード"
              description="Kinconeから出力した交通費CSVファイルを選択してください（Shift-JIS、UTF-8対応）"
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

        {/* 交通費データサマリ */}
        {transportation && transportation.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              交通費データサマリ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* 総件数 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {transportation.length}
                </div>
                <div className="text-sm text-gray-500">総件数</div>
              </div>
              
              {/* 総額 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(transportation.reduce((sum, item) => sum + (Number(item.amount) || 0), 0))}
                </div>
                <div className="text-sm text-gray-500">総額</div>
              </div>
              
              {/* 交通費合計 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(transportation.reduce((sum, item) => {
                    const transportMatch = item.route_info?.match(/交通費: (\d+)円/);
                    return sum + (transportMatch ? parseInt(transportMatch[1]) : 0);
                  }, 0))}
                </div>
                <div className="text-sm text-gray-500">交通費合計</div>
              </div>
              
              {/* 通勤費合計 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(transportation.reduce((sum, item) => {
                    const commuteMatch = item.route_info?.match(/通勤費: (\d+)円/);
                    return sum + (commuteMatch ? parseInt(commuteMatch[1]) : 0);
                  }, 0))}
                </div>
                <div className="text-sm text-gray-500">通勤費合計</div>
              </div>
              
              {/* 利用者数 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {new Set(transportation.map(item => item.employee_name).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-500">利用者数</div>
              </div>
            </div>
          </div>
        )}

        {/* 交通費データテーブル */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              交通費データ一覧 ({transportation?.length || 0}件)
            </h2>
            {transportation && transportation.length > 0 && (
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
          ) : !transportation || transportation.length === 0 ? (
            <NoDataMessage 
              title="交通費データがありません" 
              description="CSVファイルをアップロードしてデータを追加してください"
              showNavigateButton={false}
            />
          ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        集計期間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        従業員名
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        利用件数
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        交通費
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        通勤費
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        総額
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transportation?.map((item) => {
                      // route_infoから交通費と通勤費を抽出
                      const extractFees = (routeInfo: string) => {
                        const transportMatch = routeInfo?.match(/交通費: (\d+)円/);
                        const commuteMatch = routeInfo?.match(/通勤費: (\d+)円/);
                        return {
                          transportationFee: transportMatch ? parseInt(transportMatch[1]) : 0,
                          commutingFee: commuteMatch ? parseInt(commuteMatch[1]) : 0
                        };
                      };
                      
                      const { transportationFee, commutingFee } = extractFees(item.route_info || '');
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.purpose || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.employee_name}
                            </div>
                            {item.employee_number && (
                              <div className="text-xs text-gray-500">
                                従業員番号: {item.employee_number}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {item.usage_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(transportationFee)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(commutingFee)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
/**
 * CSVプレビューコンポーネント
 * アップロード前のCSVデータ確認用
 */

'use client';

import { useState } from 'react';
import { ImportResult } from '@/services/CsvImportService';
import { AlertCircle, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface CsvPreviewProps<T = any> {
  result: ImportResult<T>;
  onConfirm?: (data: T[]) => void;
  onCancel?: () => void;
  maxPreviewRows?: number;
}

export default function CsvPreview<T = any>({
  result,
  onConfirm,
  onCancel,
  maxPreviewRows = 10
}: CsvPreviewProps<T>) {
  const [showAllRows, setShowAllRows] = useState(false);

  const { success, data, errors, warnings, summary } = result;
  
  // プレビュー用のデータ
  const previewData = showAllRows ? data : data.slice(0, maxPreviewRows);
  const hasMoreRows = data.length > maxPreviewRows;
  
  // カラム情報（常にすべての列を表示）
  const allColumns = data.length > 0 ? Object.keys(data[0] as Record<string, any>) : [];
  const displayColumns = allColumns;

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            CSVプレビュー
          </h3>
          <div className="flex items-center space-x-2">
            {success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              success ? 'text-green-700' : 'text-red-700'
            }`}>
              {success ? '読み込み成功' : '読み込みエラー'}
            </span>
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">総行数:</span>
            <span className="ml-2 font-medium">{summary.totalRows}行</span>
          </div>
          <div>
            <span className="text-gray-500">有効行数:</span>
            <span className="ml-2 font-medium text-green-600">{summary.validRows}行</span>
          </div>
          <div>
            <span className="text-gray-500">エラー行数:</span>
            <span className="ml-2 font-medium text-red-600">{summary.errorRows}行</span>
          </div>
          <div>
            <span className="text-gray-500">エンコーディング:</span>
            <span className="ml-2 font-medium">{summary.encoding}</span>
          </div>
        </div>
      </div>

      {/* エラーと警告 */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="px-6 py-4 border-b">
          {errors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-700">
                  エラー ({errors.length}件)
                </span>
              </div>
              <div className="bg-red-50 rounded-md p-3 max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 mb-1">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {warnings.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-yellow-700">
                  警告 ({warnings.length}件)
                </span>
              </div>
              <div className="bg-yellow-50 rounded-md p-3 max-h-32 overflow-y-auto">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-700 mb-1">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* データプレビュー */}
      {data.length > 0 && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">
              データプレビュー
            </h4>
            <div className="flex items-center space-x-4">
              {hasMoreRows && (
                <button
                  onClick={() => setShowAllRows(!showAllRows)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  {showAllRows ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      {maxPreviewRows}行まで表示
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      全ての行を表示
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  {displayColumns.map((column) => (
                    <th
                      key={column}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase truncate max-w-32"
                      title={column}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    {displayColumns.map((column) => (
                      <td
                        key={column}
                        className="px-3 py-2 text-sm text-gray-900 truncate max-w-32"
                        title={String((row as any)[column] || '')}
                      >
                        {String((row as any)[column] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreRows && !showAllRows && (
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-500">
                残り {data.length - maxPreviewRows} 行のデータがあります
              </span>
            </div>
          )}
        </div>
      )}

      {/* アクションボタン */}
      {(onConfirm || onCancel) && (
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
          )}
          {onConfirm && (
            <button
              onClick={() => onConfirm(data)}
              disabled={!success || data.length === 0}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                success && data.length > 0
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}
            >
              インポート実行 ({data.length}件)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
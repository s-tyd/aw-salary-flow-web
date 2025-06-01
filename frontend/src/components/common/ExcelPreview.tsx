"use client";

import { useState, useEffect } from "react";
import { FileSpreadsheet, Download, Eye, X, AlertCircle } from "lucide-react";

interface ExcelPreviewProps {
  filePath: string; // templateIdとして使用
  fileName: string;
  onClose: () => void;
}

export default function ExcelPreview({
  filePath,
  fileName,
  onClose,
}: ExcelPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[][]>([]);

  useEffect(() => {
    loadExcelPreview();
  }, [filePath]);

  const loadExcelPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // プレビュー機能を一時的に無効化し、基本情報のみ表示
      setPreviewData([
        ["Excelファイルのプレビュー機能"],
        ["現在、プレビュー機能は開発中です"],
        ["ダウンロードボタンからファイルを取得してください"],
        [""],
        ["ファイル名", fileName],
        ["テンプレートID", filePath],
      ]);
      setIsLoading(false);
    } catch (err) {
      console.error("Excel preview error:", err);
      setError(
        `プレビューの表示に失敗しました: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // 認証トークンを取得
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      // APIエンドポイントからファイルをダウンロード
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const templateId = filePath; // filePathはtemplateIdとして使用
      const response = await fetch(
        `${apiUrl}/excel-templates/${templateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`ダウンロードに失敗しました: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert(
        `ダウンロードエラー: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Excelテンプレートプレビュー
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download size={16} />
              <span>ダウンロード</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  プレビューを読み込み中...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 overflow-auto h-full">
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {fileName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Excelファイルの内容をプレビューしています。必要に応じてダウンロードしてご利用ください。
                </p>
              </div>

              {/* テーブルプレビュー */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={`
                            ${rowIndex === 0 ? "bg-blue-50 dark:bg-blue-900/20 font-semibold" : ""}
                            ${rowIndex === previewData.length - 1 ? "bg-gray-50 dark:bg-gray-700/50 font-semibold" : ""}
                            ${rowIndex > 0 && rowIndex < previewData.length - 1 ? "hover:bg-gray-50 dark:hover:bg-gray-700/30" : ""}
                            border-b border-gray-200 dark:border-gray-700 last:border-b-0
                          `}
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className={`
                                px-4 py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0
                                ${rowIndex === 0 ? "text-blue-800 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"}
                                ${cellIndex === 0 ? "font-medium" : ""}
                                ${cellIndex > 0 && cell && /^[0-9,.-]+$/.test(cell.toString()) ? "text-right" : ""}
                              `}
                            >
                              {cell || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ファイル情報 */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  ファイル情報
                </h5>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <div>行数: {previewData.length}行</div>
                  <div>列数: {previewData[0]?.length || 0}列</div>
                  <div>テンプレートID: {filePath}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

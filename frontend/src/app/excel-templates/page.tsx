"use client";

import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import {
  Upload,
  Download,
  Trash2,
  Edit3,
  Plus,
  FileSpreadsheet,
  Eye,
} from "lucide-react";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useExcelTemplates } from "@/hooks/useExcelTemplates";
import { ExcelTemplateCreate } from "@/lib/types";
import ExcelPreview from "@/components/common/ExcelPreview";
import FileUpload from "@/components/common/FileUpload";

export default function ExcelTemplatesPage() {
  const { user, loading } = useAuthGuard();
  const {
    templates,
    isLoading,
    error: fetchError,
    operationLoading,
    createTemplate,
    downloadTemplate,
    deleteTemplate,
  } = useExcelTemplates();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    path: string;
    name: string;
  } | null>(null);

  // テンプレートデータの初期化
  useEffect(() => {
    // TODO: 実際のAPIからテンプレートデータを取得
  }, []);

  const handlePreview = (templateId: number, templateName: string) => {
    setPreviewFile({
      path: templateId.toString(), // APIエンドポイント用にIDを使用
      name: templateName,
    });
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  // ファイル選択と即座にアップロード処理
  const handleFileSelect = async (file: File) => {
    if (isUploading || operationLoading) return; // 重複送信を防ぐ
    
    setUploadError(null);
    
    // ファイル名から拡張子を除いてテンプレート名として使用
    const fileName = file.name;
    const templateName = fileName.replace(/\.[^/.]+$/, "");

    try {
      setIsUploading(true);
      const result = await createTemplate({
        name: templateName,
        description: `${fileName}からアップロード`,
        file: file,
      });

      if (result) {
        // 成功時の処理
        setUploadError(null);
        console.log(`テンプレート「${templateName}」をアップロードしました`);
      } else {
        throw new Error("アップロードに失敗しました");
      }
    } catch (error: any) {
      console.error("アップロードエラー:", error);
      setUploadError(error.message || "アップロード中にエラーが発生しました。");
    } finally {
      setIsUploading(false);
    }
  };

  // テンプレートダウンロード
  const handleDownload = async (templateId: number, fileName: string) => {
    try {
      await downloadTemplate(templateId, fileName);
    } catch (error) {
      console.error("ダウンロードエラー:", error);
      alert("ダウンロード中にエラーが発生しました。");
    }
  };

  // テンプレート削除
  const handleDelete = async (templateId: number) => {
    if (!confirm("このテンプレートを削除しますか？")) {
      return;
    }

    try {
      await deleteTemplate(templateId);
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除中にエラーが発生しました。");
    }
  };

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
      <Sidebar currentPath="/excel-templates" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <PageTransition>
            <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
              {/* ヘッダー */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Excelテンプレート管理
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    給与計算や勤怠管理で使用するExcelテンプレートを管理します
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    accept=".xlsx,.xls"
                    maxSize={50 * 1024 * 1024} // 50MB
                    title="新しいテンプレート"
                    description="Excelファイルを選択してアップロード"
                    isLoading={isUploading || operationLoading}
                    error={uploadError}
                    success={false}
                    showAsButton={true}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                    <span>新しいテンプレート</span>
                  </FileUpload>
                </div>
              </div>

              {/* アップロード状態表示 */}
              {((isUploading || operationLoading) || uploadError) && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  {(isUploading || operationLoading) && (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-900 dark:text-gray-100">テンプレートをアップロード中...</span>
                    </div>
                  )}
                  {uploadError && (
                    <div className="text-red-600 dark:text-red-400">
                      エラー: {uploadError}
                    </div>
                  )}
                </div>
              )}

              {/* テンプレート一覧 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    保存されているテンプレート
                  </h2>

                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        読み込み中...
                      </div>
                    </div>
                  ) : fetchError ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 dark:text-red-400 mb-2">
                        {fetchError}
                      </div>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        再読み込み
                      </button>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8">
                      <FileSpreadsheet
                        size={48}
                        className="mx-auto text-gray-400 mb-3"
                      />
                      <div className="text-gray-500 dark:text-gray-400">
                        テンプレートがまだ登録されていません
                      </div>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        上部の「新しいテンプレート」ボタンからExcelファイルをアップロードしてください
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <FileSpreadsheet
                              size={40}
                              className="text-green-600 dark:text-green-400"
                            />
                            <div>
                              <div className="flex items-center space-x-3">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                  {template.name}
                                </h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  v{template.version}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {template.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                作成日:{" "}
                                {new Date(
                                  template.created_at,
                                ).toLocaleDateString("ja-JP", {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handlePreview(template.id, template.name)
                              }
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded-md transition-colors"
                              title="プレビュー"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(template.id, template.file_name)
                              }
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors"
                              title="ダウンロード"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(template.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                              title="削除"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>

      {/* Excelプレビューモーダル */}
      {showPreview && previewFile && (
        <ExcelPreview
          filePath={previewFile.path}
          fileName={previewFile.name}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}

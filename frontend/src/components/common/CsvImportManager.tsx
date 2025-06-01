/**
 * 汎用CSVインポート管理コンポーネント
 */

import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import FileUpload from './FileUpload';
import CsvPreview from './CsvPreview';
import { ImportResult } from '@/services/CsvImportService';

export type ImportStep = 'upload' | 'preview' | 'importing' | 'completed';

export interface ImportResponse {
  imported_count: number;
  errors: string[];
  success: boolean;
}

interface CsvImportManagerProps<T> {
  title: string;
  description: string;
  uploadTitle: string;
  uploadDescription: string;
  hasData: boolean;
  onParseCsv: (file: File) => Promise<ImportResult<Partial<T>>>;
  onImportCsv: (file: File, calculationPeriodId: number) => Promise<ImportResponse>;
  children?: React.ReactNode; // サマリーやテーブル表示用
}

export default function CsvImportManager<T>({
  title,
  description,
  uploadTitle,
  uploadDescription,
  hasData,
  onParseCsv,
  onImportCsv,
  children
}: CsvImportManagerProps<T>) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvParseResult, setCsvParseResult] = useState<ImportResult<Partial<T>> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setStep('preview');
    setOriginalFile(file);

    try {
      const parseResult = await onParseCsv(file);
      setCsvParseResult(parseResult);
    } catch (error) {
      console.error('CSV解析エラー:', error);
      setStep('upload');
      setOriginalFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleImportConfirm = async (data: Partial<T>[]) => {
    if (!originalFile) {
      console.error('元のファイルが見つかりません');
      return;
    }

    setStep('importing');
    setImportResult(null);

    try {
      const result = await onImportCsv(originalFile, 1);
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* CSVアップロード */}
      {step === 'upload' && !hasData && (
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            CSVファイルのアップロード
          </h2>
          <FileUpload
            onFileSelect={handleFileUpload}
            accept=".csv"
            isLoading={uploading}
            title={uploadTitle}
            description={uploadDescription}
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

      {/* インポート結果 */}
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

      {/* データ表示エリア（サマリー + テーブル） */}
      {children}
    </div>
  );
}
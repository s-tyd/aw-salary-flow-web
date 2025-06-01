'use client';

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCalculationPeriods } from '@/hooks/useCalculationPeriods';
import { useExcelTemplates } from '@/hooks/useExcelTemplates';
import { usePayroll } from '@/hooks/usePayroll';
import { useDate } from '@/contexts/DateContext';
import config from '@/lib/config';
import { redirect } from 'next/navigation';
import { Download, Play, FileSpreadsheet, Calendar, Users } from 'lucide-react';
import { apiClient } from '@/lib/api/base';

// 時間フォーマット関数（文字列対応）
const formatWorkHours = (hours: string | undefined | null): string => {
  if (!hours) return '0:00';
  
  // 文字列の場合はそのまま返す（HH:MM形式想定）
  if (typeof hours === 'string') {
    return hours;
  }
  
  return '0:00';
};

// 金額フォーマット関数  
const formatCurrency = (amount: number | undefined | null): string => {
  if (!amount) return '¥0';
  return `¥${amount.toLocaleString()}`;
};


export default function DebugPage() {
  // 開発モードでない場合はリダイレクト
  if (!config.features.payrollTest) {
    redirect('/dashboard');
  }

  const { currentYear, currentMonth } = useDate();
  const { checkPeriod } = useCalculationPeriods();
  const { templates, loading: templatesLoading, fetchTemplates } = useExcelTemplates();
  const { loading: payrollLoading, error: payrollError, generatePayrollExcel, getWorkDataSummary } = usePayroll();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [calculationPeriodId, setCalculationPeriodId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [workDataSummary, setWorkDataSummary] = useState<any[]>([]);
  const [step, setStep] = useState<'setup' | 'preview' | 'generating' | 'completed'>('setup');

  // 初期化
  useEffect(() => {
    fetchTemplates();
    checkCurrentPeriod();
  }, [currentYear, currentMonth]);

  const checkCurrentPeriod = async () => {
    try {
      const periodCheck = await checkPeriod(currentYear, currentMonth);
      console.log('Period check result:', periodCheck);
      
      if (periodCheck.exists && periodCheck.period) {
        setCalculationPeriodId(periodCheck.period.id);
      } else {
        console.log('計算期間が存在しません。テスト用に仮の期間を作成します。');
        // デバッグ用：期間が存在しない場合は適当なIDを設定
        setCalculationPeriodId(1);
      }
    } catch (error) {
      console.error('計算期間チェックエラー:', error);
      // エラーが発生した場合もテスト用に仮のIDを設定
      setCalculationPeriodId(1);
    }
  };

  const handlePreviewData = async () => {
    if (!calculationPeriodId) return;

    setStep('preview');
    try {
      const summary = await getWorkDataSummary(calculationPeriodId);
      if (summary) {
        setWorkDataSummary(summary);
      }
    } catch (error) {
      console.error('データプレビューエラー:', error);
      // デバッグ用にエラー詳細を表示
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        calculationPeriodId,
        error
      });
      setStep('setup'); // エラー時はsetupに戻る
    }
  };

  const handleGenerateExcel = async () => {
    if (!calculationPeriodId || !selectedTemplateId) return;

    setStep('generating');
    try {
      const result = await generatePayrollExcel({
        calculation_period_id: calculationPeriodId,
        template_id: selectedTemplateId
      });

      if (result) {
        setTestResult(result);
        setStep('completed');
      }
    } catch (error) {
      console.error('Excel生成エラー:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        calculationPeriodId,
        selectedTemplateId,
        error
      });
      setStep('setup');
    }
  };

  const resetTest = () => {
    setStep('setup');
    setTestResult(null);
    setWorkDataSummary([]);
  };

  const handleDownload = async (downloadUrl: string, fileName: string) => {
    try {
      await apiClient.downloadFile(downloadUrl, fileName);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードに失敗しました');
    }
  };

  return (
    <ProtectedLayout 
      currentPath="/debug"
      title="デバッグ (開発モード)"
      subtitle="給与計算処理のデバッグとテスト - 本番環境では表示されません"
    >
      <div className="space-y-6">
        {/* 警告バナー */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">開発モード専用機能</h3>
              <p className="text-sm text-yellow-700 mt-1">
                この機能は開発環境でのみ利用可能です。本番環境では表示されません。
              </p>
            </div>
          </div>
        </div>

        {/* ステップ表示 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">給与計算デバッグ</h2>
            <div className="flex items-center space-x-4 mt-4">
              {['setup', 'preview', 'generating', 'completed'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName ? 'bg-blue-600 text-white' : 
                    ['setup', 'preview', 'generating', 'completed'].indexOf(step) > index ? 'bg-green-600 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Setup Step */}
            {step === 'setup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    <Calendar className="inline mr-2" size={20} />
                    対象期間: {currentYear}年{currentMonth}月
                  </h3>
                  {calculationPeriodId ? (
                    <p className="text-sm text-green-600">✅ 計算期間が設定されています (ID: {calculationPeriodId})</p>
                  ) : (
                    <p className="text-sm text-red-600">❌ 計算期間が設定されていません</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileSpreadsheet className="inline mr-2" size={16} />
                    Excelテンプレート選択
                  </label>
                  {templatesLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <select
                      value={selectedTemplateId || ''}
                      onChange={(e) => setSelectedTemplateId(Number(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="">テンプレートを選択してください</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} (v{template.version})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handlePreviewData}
                    disabled={!calculationPeriodId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    <Users className="mr-2" size={16} />
                    データをプレビュー
                  </button>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {step === 'preview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">勤務データサマリ</h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-4">対象従業員数: {workDataSummary.length}名</p>
                    
                    {workDataSummary.length > 0 && (
                      <div className="max-h-60 overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300 dark:border-gray-600">
                              <th className="text-left py-3 px-2 font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700">社員番号</th>
                              <th className="text-left py-3 px-2 font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700">氏名</th>
                              <th className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700">勤務日数</th>
                              <th className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700">総労働時間</th>
                              <th className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700">Freee経費</th>
                              <th className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700">Kincone経費</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workDataSummary.map((emp, index) => (
                              <tr key={index} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-2 px-2 text-gray-900 dark:text-gray-100 font-medium">{emp.employee_number}</td>
                                <td className="py-2 px-2 text-gray-900 dark:text-gray-100 font-medium">{emp.employee_name}</td>
                                <td className="py-2 px-2 text-right text-gray-800 dark:text-gray-200">{emp.working_days || 0}日</td>
                                <td className="py-2 px-2 text-right text-gray-800 dark:text-gray-200">
                                  <div className="font-semibold">{formatWorkHours(emp.total_work_hours)}</div>
                                </td>
                                <td className="py-2 px-2 text-right text-gray-800 dark:text-gray-200">{formatCurrency(emp.freee_expenses)}</td>
                                <td className="py-2 px-2 text-right text-gray-800 dark:text-gray-200">{formatCurrency(emp.kincone_expenses)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* 生データデバッグ表示 */}
                    {workDataSummary.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">生データ詳細（デバッグ用）</h4>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-xs font-mono overflow-x-auto">
                          <pre className="text-gray-700 dark:text-gray-300">
                            {JSON.stringify(workDataSummary.slice(0, 3), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('setup')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleGenerateExcel}
                    disabled={!selectedTemplateId}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    <Play className="mr-2" size={16} />
                    Excel生成実行
                  </button>
                </div>
              </div>
            )}

            {/* Generating Step */}
            {step === 'generating' && (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-gray-600 mt-4">給与計算処理を実行中...</p>
                <p className="text-sm text-gray-500 mt-2">しばらくお待ちください</p>
              </div>
            )}

            {/* Completed Step */}
            {step === 'completed' && testResult && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${
                  testResult.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    testResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.status === 'success' ? '✅ 処理完了' : '❌ 処理失敗'}
                  </h3>
                  
                  {testResult.status === 'success' && testResult.file_name && (
                    <div className="space-y-2">
                      <p className="text-green-700">ファイル名: {testResult.file_name}</p>
                      {testResult.download_url && (
                        <button
                          onClick={() => handleDownload(testResult.download_url, testResult.file_name)}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <Download className="mr-2" size={16} />
                          ダウンロード
                        </button>
                      )}
                    </div>
                  )}

                  {testResult.messages && testResult.messages.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">メッセージ:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {testResult.messages.map((message: string, index: number) => (
                          <li key={index} className="text-sm">{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={resetTest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    新しいデバッグを実行
                  </button>
                </div>
              </div>
            )}

            {/* エラー表示 */}
            {payrollError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">エラーが発生しました</p>
                <p className="text-red-700 text-sm mt-1">{payrollError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
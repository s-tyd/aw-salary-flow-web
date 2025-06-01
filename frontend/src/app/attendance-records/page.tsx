'use client';

import React, { useMemo } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import CsvImportManager from '@/components/common/CsvImportManager';
import DataSummary, { SummaryItem } from '@/components/common/DataSummary';
import DataTable from '@/components/common/DataTable';
import { useAttendanceRecords } from '@/hooks/useAttendanceRecords';
import { AttendanceRecord } from '@/services/AttendanceRecordService';
import { formatDate } from '@/utils/formatters';
import { TableColumn } from '@/lib/types';

export default function AttendanceRecordsPage() {
  const filters = useMemo(() => ({}), []);
  const { records, loading, error, parseCsv, importCsv, deleteAllRecords } = useAttendanceRecords(filters);

  const handleDeleteAllData = async () => {
    if (!confirm('全ての勤務データを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const result = await deleteAllRecords();
      alert(result.message);
    } catch (error) {
      console.error('データ削除エラー:', error);
      alert('データの削除に失敗しました');
    }
  };

  // 時間文字列を分に変換（HHH:MM形式や小数点形式に対応）
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr || timeStr === '-' || timeStr === '' || timeStr === '0') return 0;
    
    // HHH:MM形式（例: "164:57", "17:43"）
    const timeMatch = timeStr.match(/^(\d+):(\d+)$/);
    if (timeMatch) {
      return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    }
    
    // 小数点形式（例: "7.5"時間）
    const decimalMatch = timeStr.match(/^(\d+(?:\.\d+)?)$/);
    if (decimalMatch) {
      return Math.round(parseFloat(decimalMatch[1]) * 60);
    }
    
    return 0;
  };

  // 分を時間文字列に変換（見やすい形式）
  const formatMinutesToTime = (minutes: number): string => {
    if (minutes === 0) return '0時間';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60); // 小数点以下を四捨五入
    
    if (mins === 0) {
      return `${hours}時間`;
    } else {
      return `${hours}時間${mins}分`;
    }
  };

  // サマリーデータの計算
  const summaryItems: SummaryItem[] = useMemo(() => {
    if (!records || records.length === 0) return [];

    const uniqueEmployees = new Set(records.map(record => record.employee_name).filter(Boolean)).size;
    
    // 各従業員の残業時間を計算
    const employeeOvertimes = records.map(record => ({
      name: record.employee_name,
      overtimeMinutes: parseTimeToMinutes(record.overtime_work_time || ''),
      workDays: record.work_days || 0
    })).filter(emp => emp.name);

    // 残業者数（残業時間が0より大きい人）
    const overtimeEmployees = employeeOvertimes.filter(emp => emp.overtimeMinutes > 0).length;
    
    // 最大残業時間
    const maxOvertimeMinutes = Math.max(...employeeOvertimes.map(emp => emp.overtimeMinutes), 0);
    
    // 平均残業時間（残業者のみ）
    const avgOvertimeMinutes = overtimeEmployees > 0 
      ? employeeOvertimes.filter(emp => emp.overtimeMinutes > 0)
          .reduce((sum, emp) => sum + emp.overtimeMinutes, 0) / overtimeEmployees
      : 0;
    
    // 平均勤務日数
    const avgWorkDays = uniqueEmployees > 0 
      ? employeeOvertimes.reduce((sum, emp) => sum + emp.workDays, 0) / uniqueEmployees 
      : 0;

    // 残業率（残業している人の割合）
    const overtimeRate = uniqueEmployees > 0 ? (overtimeEmployees / uniqueEmployees) * 100 : 0;

    return [
      { label: '対象従業員数', value: `${uniqueEmployees}名`, color: 'blue' },
      { label: '最大残業時間', value: formatMinutesToTime(maxOvertimeMinutes), color: 'purple' },
      { label: '平均残業時間', value: formatMinutesToTime(avgOvertimeMinutes), color: 'yellow' },
      { label: '平均勤務日数', value: `${avgWorkDays.toFixed(1)}日`, color: 'green' }
    ];
  }, [records]);

  // 残業ランキングデータの計算
  const overtimeRanking = useMemo(() => {
    if (!records || records.length === 0) return [];

    return records
      .map(record => ({
        name: record.employee_name || '不明',
        number: record.employee_number || '-',
        overtimeMinutes: parseTimeToMinutes(record.overtime_work_time || ''),
        overtimeFormatted: record.overtime_work_time || '0:00',
        workDays: record.work_days || 0
      }))
      .filter(emp => emp.name !== '不明')
      .sort((a, b) => b.overtimeMinutes - a.overtimeMinutes)
      .slice(0, 10); // トップ10
  }, [records]);

  // テーブル列定義
  const columns: TableColumn<AttendanceRecord>[] = useMemo(() => [
    {
      key: 'period_start',
      label: '期間',
      render: (_, record) => (
        record.period_start && record.period_end ? (
          <div>
            <div className="font-medium">
              {formatDate(record.period_start)} 〜
            </div>
            <div className="text-gray-500">
              {formatDate(record.period_end)}
            </div>
          </div>
        ) : '-'
      ),
    },
    {
      key: 'employee_name',
      label: '従業員名',
      render: (_, record) => (
        <div>
          <div className="text-sm text-gray-900">
            {record.employee_name}
          </div>
          {record.employee_number && (
            <div className="text-xs text-gray-500">
              従業員番号: {record.employee_number}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'work_days',
      label: '勤務日数',
      render: (value) => `${value || 0}日`,
    },
    {
      key: 'actual_work_time',
      label: '実労働時間',
      render: (value) => value || '-',
    },
    {
      key: 'overtime_work_time',
      label: '残業時間',
      render: (value) => value || '-',
    },
    {
      key: 'paid_leave_used',
      label: '有給取得',
      render: (value) => value ? `${value}日` : '-',
    },
    {
      key: 'paid_leave_remaining',
      label: '有給残',
      render: (value) => value ? `${value}日` : '-',
    },
  ], []);

  return (
    <ProtectedLayout currentPath="/attendance-records">
      <CsvImportManager<AttendanceRecord>
        title="勤務データ"
        description="勤務管理システムから出力した勤務データCSVファイルをアップロードして管理できます"
        uploadTitle="勤務データCSVファイルをアップロード"
        uploadDescription="勤務管理システムから出力した勤務データCSVファイルを選択してください（Shift-JIS、UTF-8対応）"
        hasData={records && records.length > 0}
        onParseCsv={parseCsv}
        onImportCsv={importCsv}
      >
        {/* データサマリー */}
        {records && records.length > 0 && (
          <DataSummary
            title="勤務データサマリ"
            items={summaryItems}
            breakdown={overtimeRanking.length > 0 ? {
              title: "残業時間ランキング",
              description: "残業時間の多い順に表示",
              items: overtimeRanking.slice(0, 6).map((emp, index) => {
                const isTop3 = index < 3;
                const rankColors = ['🥇', '🥈', '🥉'];
                
                return {
                  label: `${isTop3 ? rankColors[index] : `${index + 1}.`} ${emp.name}`,
                  sublabel: `${emp.number} - ${emp.overtimeFormatted}`,
                  isHighlight: isTop3
                };
              })
            } : undefined}
          />
        )}

        {/* データテーブル */}
        <DataTable
          data={records || []}
          columns={columns}
          loading={loading}
          title="勤務データ一覧"
          emptyTitle="勤務データがありません"
          emptyDescription="CSVファイルをアップロードしてデータを追加してください"
          headerActions={
            records && records.length > 0 ? (
              <button
                onClick={handleDeleteAllData}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                全データ削除
              </button>
            ) : undefined
          }
        />
      </CsvImportManager>
    </ProtectedLayout>
  );
}
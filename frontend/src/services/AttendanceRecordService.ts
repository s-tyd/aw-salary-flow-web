/**
 * 勤務データサービス
 */

import { BaseCsvImportService } from './base/BaseCsvImportService';
import { parseDate } from '@/utils/csvParsers';

export interface AttendanceRecord {
  id: number;
  calculation_period_id: number;
  employee_id?: number;
  employee_number: string;
  employee_name: string;
  period_start?: string;
  period_end?: string;
  work_days?: number;
  total_work_time?: string;
  regular_work_time?: string;
  actual_work_time?: string;
  overtime_work_time?: string;
  late_night_work_time?: string;
  holiday_work_time?: string;
  paid_leave_used?: number;
  paid_leave_remaining?: number;
  absence_days?: number;
  tardiness_count?: number;
  early_leave_count?: number;
  data_source: string;
  raw_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecordImportResponse {
  imported_count: number;
  errors: string[];
  success: boolean;
}

export interface AttendanceRecordFilters {
  calculation_period_id?: number;
  employee_id?: number;
  skip?: number;
  limit?: number;
}

// 勤務データ用のインポート設定
export const ATTENDANCE_RECORD_IMPORT_CONFIG = {
  requiredColumns: [
    '従業員番号',
    '従業員名'
  ],
  columnAliases: {
    '従業員番号': ['従業員番号', '社員番号', '社員No', 'Employee Number', 'Employee ID'],
    '従業員名': ['従業員名', '社員名', '氏名', 'Employee Name', 'Name'],
    '集計開始日': ['集計開始日', '開始日', '期間開始', 'Period Start', 'Start Date'],
    '集計終了日': ['集計終了日', '終了日', '期間終了', 'Period End', 'End Date'],
    '勤務日数': ['勤務日数', '出勤日数', 'Work Days', 'Working Days'],
    '総労働時間': ['総労働時間', '労働時間合計', 'Total Work Time', 'Total Hours'],
    '所定労働時間': ['所定労働時間', '基準労働時間', 'Regular Work Time', 'Standard Hours'],
    '実労働時間': ['実労働時間', '実際労働時間', 'Actual Work Time', 'Actual Hours'],
    '時間外労働時間': ['時間外労働時間', '残業時間', 'Overtime Work Time', 'Overtime Hours'],
    '深夜労働時間': ['深夜労働時間', '深夜時間', 'Late Night Work Time', 'Night Hours'],
    '休日労働時間': ['休日労働時間', '休日時間', 'Holiday Work Time', 'Holiday Hours'],
    '有給取得日数': ['有給取得日数', '有給取得', 'Paid Leave Used', 'PTO Used'],
    '有給残日数': ['有給残日数', '有給残', 'Paid Leave Remaining', 'PTO Remaining'],
    '欠勤日数': ['欠勤日数', '欠勤', 'Absence Days', 'Absences'],
    '遅刻回数': ['遅刻回数', '遅刻', 'Tardiness Count', 'Late Count'],
    '早退回数': ['早退回数', '早退', 'Early Leave Count', 'Early Departure Count']
  },
  customValidation: (data: Record<string, string>[]) => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      // 従業員番号の検証
      const employeeNumber = row['従業員番号'];
      if (!employeeNumber || employeeNumber.trim() === '') {
        errors.push(`行 ${index + 2}: 従業員番号が必須です`);
      }
      
      // 従業員名の検証
      const employeeName = row['従業員名'];
      if (!employeeName || employeeName.trim() === '') {
        errors.push(`行 ${index + 2}: 従業員名が必須です`);
      }
      
      // 勤務日数の検証
      const workDays = row['勤務日数'];
      if (workDays && (isNaN(Number(workDays)) || Number(workDays) < 0)) {
        errors.push(`行 ${index + 2}: 勤務日数が正しくありません`);
      }
      
      // 有給日数の検証
      const paidLeaveUsed = row['有給取得日数'];
      if (paidLeaveUsed && isNaN(Number(paidLeaveUsed.replace(/[,]/g, '')))) {
        errors.push(`行 ${index + 2}: 有給取得日数が数値ではありません`);
      }
    });
    
    return errors;
  }
};

class AttendanceRecordServiceImpl extends BaseCsvImportService<AttendanceRecord, AttendanceRecordImportResponse> {
  protected readonly basePath = '/attendance-records';
  protected readonly importConfig = ATTENDANCE_RECORD_IMPORT_CONFIG;

  protected parseRow(row: Record<string, string>, index: number): Partial<AttendanceRecord> | null {
    try {
      // 基本情報
      const employeeNumber = row['従業員番号'] || '';
      const employeeName = row['従業員名'] || '';
      
      // 期間情報
      const periodStart = this.parseDate(row['集計開始日']);
      const periodEnd = this.parseDate(row['集計終了日']);
      
      // 数値情報
      const workDays = this.parseUsageCount(row['勤務日数'] || '0');
      const paidLeaveUsed = this.parseAmount(row['有給取得日数'] || '0');
      const paidLeaveRemaining = this.parseAmount(row['有給残日数'] || '0');
      const absenceDays = this.parseUsageCount(row['欠勤日数'] || '0');
      const tardinessCount = this.parseUsageCount(row['遅刻回数'] || '0');
      const earlyLeaveCount = this.parseUsageCount(row['早退回数'] || '0');
      
      // 時間情報（文字列として保存）
      const totalWorkTime = row['総労働時間'] || '';
      const regularWorkTime = row['所定労働時間'] || '';
      const actualWorkTime = row['実労働時間'] || '';
      const overtimeWorkTime = row['時間外労働時間'] || '';
      const lateNightWorkTime = row['深夜労働時間'] || '';
      const holidayWorkTime = row['休日労働時間'] || '';
      
      return {
        employee_number: employeeNumber,
        employee_name: employeeName,
        period_start: periodStart,
        period_end: periodEnd,
        work_days: workDays,
        total_work_time: totalWorkTime,
        regular_work_time: regularWorkTime,
        actual_work_time: actualWorkTime,
        overtime_work_time: overtimeWorkTime,
        late_night_work_time: lateNightWorkTime,
        holiday_work_time: holidayWorkTime,
        paid_leave_used: paidLeaveUsed,
        paid_leave_remaining: paidLeaveRemaining,
        absence_days: absenceDays,
        tardiness_count: tardinessCount,
        early_leave_count: earlyLeaveCount,
        data_source: 'attendance_csv',
        raw_data: { ...row }
      };
    } catch (error) {
      console.error(`行 ${index + 2} の変換エラー:`, error);
      return null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const AttendanceRecordService = new AttendanceRecordServiceImpl();

// 後方互換性のためのエイリアス
export const attendanceRecordService = {
  getRecords: (filters?: AttendanceRecordFilters) => AttendanceRecordService.getData(filters),
  getRecord: (id: number) => AttendanceRecordService.getItem(id),
  parseCsv: (file: File) => AttendanceRecordService.parseCsv(file),
  importCsv: (file: File, calculationPeriodId?: number) => AttendanceRecordService.importCsv(file, calculationPeriodId || 1),
  deleteRecord: (id: number) => AttendanceRecordService.deleteItem(id),
  deleteAllRecords: () => AttendanceRecordService.deleteAll()
};
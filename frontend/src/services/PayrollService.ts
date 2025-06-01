/**
 * 給与計算サービス
 * Firebase Cloud Functionsからの移行版
 */

import { apiClient } from '@/lib/api/base';

export interface PayrollGenerationRequest {
  calculation_period_id: number;
  template_id: number;
}

export interface PayrollGenerationResponse {
  status: string;
  messages: string[];
  file_name?: string;
  download_url?: string;
}

export interface WorkDataSummary {
  employee_id: number;
  employee_number: string;
  employee_name: string;
  working_days?: number;
  total_work_hours?: number;
  paid_leave_days?: number;
  statutory_holiday_hours?: number;
  night_working_hours?: number;
  absence_days?: number;
  remote_count?: number;
  lunch_count?: number;
  office_count?: number;
  event_count?: number;
  trip_night_before_count?: number;
  trip_count?: number;
  travel_onday_count?: number;
  travel_holidays_count?: number;
  special_holiday?: number;
  special_holiday_without_pay?: number;
  kiwi_points?: number;
  freee_expenses?: number;
  kincone_expenses?: number;
  no_remote_allowance_limit: boolean;
}

export class PayrollService {
  /**
   * 給与計算Excelファイルを生成
   */
  static async generatePayrollExcel(request: PayrollGenerationRequest): Promise<PayrollGenerationResponse> {
    return await apiClient.post<PayrollGenerationResponse>('/payroll/generate', request);
  }

  /**
   * 指定した計算期間の勤務データサマリを取得
   */
  static async getWorkDataSummary(calculationPeriodId: number): Promise<WorkDataSummary[]> {
    return await apiClient.get<WorkDataSummary[]>(`/payroll/work-data-summary/${calculationPeriodId}`);
  }
}

export default PayrollService;
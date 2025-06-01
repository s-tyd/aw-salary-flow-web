/**
 * Kincone交通費サービス
 */

import { ApiService } from './ApiService';
import { CsvImportService, ImportResult } from './CsvImportService';

export interface KinconeTransportation {
  id: number;
  calculation_period_id: number;
  employee_id?: number;
  employee_number: string;
  employee_name: string;
  usage_date?: string;
  departure: string;
  destination: string;
  transportation_type?: string;
  amount: number;
  usage_count: number;
  route_info?: string;
  purpose?: string;
  approval_status: string;
  data_source: string;
  created_at: string;
  updated_at: string;
}

export interface KinconeTransportationImportResponse {
  imported_count: number;
  errors: string[];
  success: boolean;
}

export interface KinconeTransportationFilters {
  calculation_period_id?: number;
  employee_id?: number;
  skip?: number;
  limit?: number;
}

// Kincone交通費用のインポート設定
export const KINCONE_TRANSPORTATION_IMPORT_CONFIG = {
  requiredColumns: [
    '従業員番号',
    '従業員名',
    '集計開始日',
    '集計終了日',
    '利用件数',
    '交通費',
    '通勤費',
    '総額'
  ],
  columnAliases: {
    '従業員番号': ['従業員番号', '社員番号', '社員No', 'Employee ID'],
    '従業員名': ['従業員名', '社員名', '氏名', 'Name'],
    '集計開始日': ['集計開始日', '開始日', 'Start Date'],
    '集計終了日': ['集計終了日', '終了日', 'End Date'],
    '利用件数': ['利用件数', '件数', '回数', 'Count'],
    '交通費': ['交通費', 'Transportation Fee'],
    '通勤費': ['通勤費', 'Commuting Fee'],
    '総額': ['総額', '合計', 'Total']
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
      
      // 交通費の検証
      const transportationFee = row['交通費'];
      if (transportationFee && isNaN(Number(transportationFee.replace(/[,円]/g, '')))) {
        errors.push(`行 ${index + 2}: 交通費が数値ではありません`);
      }
      
      // 通勤費の検証
      const commutingFee = row['通勤費'];
      if (commutingFee && isNaN(Number(commutingFee.replace(/[,円]/g, '')))) {
        errors.push(`行 ${index + 2}: 通勤費が数値ではありません`);
      }
      
      // 総額の検証
      const total = row['総額'];
      if (total && isNaN(Number(total.replace(/[,円]/g, '')))) {
        errors.push(`行 ${index + 2}: 総額が数値ではありません`);
      }
    });
    
    return errors;
  }
};

export class KinconeTransportationService {
  private static readonly BASE_PATH = '/kincone-transportation';

  /**
   * 交通費データ一覧を取得
   */
  static async getTransportation(filters: KinconeTransportationFilters = {}): Promise<KinconeTransportation[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const endpoint = params.toString() 
      ? `${this.BASE_PATH}?${params.toString()}`
      : this.BASE_PATH;
    
    return ApiService.get<KinconeTransportation[]>(endpoint);
  }

  /**
   * 特定の交通費データを取得
   */
  static async getTransportationItem(id: number): Promise<KinconeTransportation> {
    return ApiService.get<KinconeTransportation>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * CSVファイルをクライアント側で解析
   */
  static async parseCsv(file: File): Promise<ImportResult<Partial<KinconeTransportation>>> {
    return CsvImportService.importCsv(
      file,
      KINCONE_TRANSPORTATION_IMPORT_CONFIG,
      (row, index) => {
        try {
          // 金額をパース
          const transportationFee = this.parseAmount(row['交通費'] || '0');
          const commutingFee = this.parseAmount(row['通勤費'] || '0');
          const totalAmount = this.parseAmount(row['総額'] || '0');
          const usageCount = this.parseUsageCount(row['利用件数'] || '1');
          
          // 日付をパース
          const startDate = this.parseDate(row['集計開始日']);
          const endDate = this.parseDate(row['集計終了日']);
          
          return {
            employee_number: row['従業員番号'] || '',
            employee_name: row['従業員名'] || '',
            usage_date: startDate, // 集計開始日を使用日として使用
            departure: '', // CSVに含まれていない
            destination: '', // CSVに含まれていない
            transportation_type: '', // CSVに含まれていない
            amount: totalAmount, // 総額を金額として使用
            usage_count: usageCount,
            route_info: `交通費: ${transportationFee}円, 通勤費: ${commutingFee}円`, // 詳細情報として保存
            purpose: `${startDate} - ${endDate}`, // 期間を目的として保存
            approval_status: 'pending',
            data_source: 'kincone_csv'
          };
        } catch (error) {
          console.error(`行 ${index + 2} の変換エラー:`, error);
          return null;
        }
      }
    );
  }

  /**
   * CSVファイルをサーバーにアップロード
   */
  static async importCsv(
    file: File,
    calculationPeriodId: number = 1
  ): Promise<KinconeTransportationImportResponse> {
    const endpoint = `${this.BASE_PATH}/import-csv?calculation_period_id=${calculationPeriodId}`;
    return ApiService.uploadFile<KinconeTransportationImportResponse>(endpoint, file, 'file');
  }

  /**
   * 金額文字列を数値に変換
   */
  private static parseAmount(amountStr: string): number {
    if (!amountStr || amountStr.trim() === '') return 0;
    // カンマと円記号を除去して数値に変換
    const cleanAmount = amountStr.replace(/[,円￥]/g, '');
    const amount = parseFloat(cleanAmount);
    return isNaN(amount) ? 0 : amount;
  }

  /**
   * 利用回数文字列を数値に変換
   */
  private static parseUsageCount(countStr: string): number {
    if (!countStr || countStr.trim() === '') return 1;
    const count = parseInt(countStr);
    return isNaN(count) ? 1 : count;
  }

  /**
   * 日付文字列をISO形式に変換
   */
  private static parseDate(dateStr?: string): string | undefined {
    if (!dateStr || dateStr.trim() === '') return undefined;
    
    try {
      // YYYY/MM/DD形式を想定
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString().split('T')[0]; // YYYY-MM-DD形式
    } catch {
      return undefined;
    }
  }

  /**
   * 交通費データを削除
   */
  static async deleteTransportation(id: number): Promise<void> {
    await ApiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * 全ての交通費データを削除
   */
  static async deleteAllTransportation(): Promise<{ message: string; deleted_count: number }> {
    return ApiService.delete(`${this.BASE_PATH}/`);
  }
}
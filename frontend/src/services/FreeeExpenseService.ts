/**
 * Freee経費サービス
 */

import { BaseCsvImportService } from './base/BaseCsvImportService';
import { FREEE_EXPENSE_IMPORT_CONFIG } from './CsvImportService';
import { extractEmployeeNumber } from '@/utils/csvParsers';

export interface FreeeExpense {
  id: number;
  calculation_period_id: number;
  employee_id?: number;
  income_expense_type: string;
  management_number?: string;
  occurrence_date?: string;
  payment_due_date?: string;
  partner_name: string;
  account_item: string;
  tax_classification: string;
  amount: number;
  tax_calculation_type: string;
  tax_amount: number;
  notes?: string;
  item_name?: string;
  department?: string;
  memo_tags?: string;
  payment_date?: string;
  payment_account?: string;
  payment_amount?: number;
  employee_number?: string;
  data_source: string;
  created_at: string;
  updated_at: string;
}

export interface FreeeExpenseImportResponse {
  imported_count: number;
  errors: string[];
  success: boolean;
}

export interface FreeeExpenseFilters {
  calculation_period_id?: number;
  employee_id?: number;
  skip?: number;
  limit?: number;
}

class FreeeExpenseServiceImpl extends BaseCsvImportService<FreeeExpense, FreeeExpenseImportResponse> {
  protected readonly basePath = '/freee-expenses';
  protected readonly importConfig = FREEE_EXPENSE_IMPORT_CONFIG;

  protected parseRow(row: Record<string, string>, index: number): Partial<FreeeExpense> | null {
    try {
      // 社員番号を抽出
      const employeeNumber = extractEmployeeNumber(row['取引先'] || '');
      
      // 金額をパース
      const amount = this.parseAmount(row['金額'] || '0');
      const taxAmount = this.parseAmount(row['税額'] || '0');
      const paymentAmount = this.parseAmount(row['支払金額'] || '0');
      
      // 日付をパース
      const occurrenceDate = this.parseDate(row['発生日']);
      const paymentDueDate = this.parseDate(row['支払期日']);
      const paymentDate = this.parseDate(row['支払日']);
      
      return {
        income_expense_type: row['収支区分'] || '',
        management_number: row['管理番号'] || '',
        occurrence_date: occurrenceDate,
        payment_due_date: paymentDueDate,
        partner_name: row['取引先'] || '',
        account_item: row['勘定科目'] || '',
        tax_classification: row['税区分'] || '',
        amount,
        tax_calculation_type: row['税計算区分'] || '',
        tax_amount: taxAmount,
        notes: row['備考'] || '',
        item_name: row['品目'] || '',
        department: row['部門'] || '',
        memo_tags: row['メモタグ（複数指定可、カンマ区切り）'] || '',
        payment_date: paymentDate,
        payment_account: row['支払口座'] || '',
        payment_amount: paymentAmount,
        employee_number: employeeNumber,
        data_source: 'freee_csv'
      };
    } catch (error) {
      console.error(`行 ${index + 2} の変換エラー:`, error);
      return null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const FreeeExpenseService = new FreeeExpenseServiceImpl();

// 後方互換性のためのエイリアス（既存コードが動作するように）
export const freeeExpenseService = {
  getExpenses: (filters?: FreeeExpenseFilters) => FreeeExpenseService.getData(filters),
  getExpense: (id: number) => FreeeExpenseService.getItem(id),
  parseCsv: (file: File) => FreeeExpenseService.parseCsv(file),
  importCsv: (file: File, calculationPeriodId?: number) => FreeeExpenseService.importCsv(file, calculationPeriodId || 1),
  deleteExpense: (id: number) => FreeeExpenseService.deleteItem(id),
  deleteAllExpenses: () => FreeeExpenseService.deleteAll()
};
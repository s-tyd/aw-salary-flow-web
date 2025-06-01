/**
 * 基底CSVインポートサービス
 */

import { ApiService } from '../ApiService';
import { CsvImportService, ImportResult, ImportValidationRule } from '../CsvImportService';
import { parseAmount, parseUsageCount, parseDate } from '@/utils/csvParsers';

export interface BaseImportResponse {
  imported_count: number;
  errors: string[];
  success: boolean;
}

export interface BaseFilters {
  calculation_period_id?: number;
  employee_id?: number;
  skip?: number;
  limit?: number;
}

export abstract class BaseCsvImportService<T, ImportResponse extends BaseImportResponse> {
  protected abstract readonly basePath: string;
  protected abstract readonly importConfig: ImportValidationRule;

  /**
   * サブクラスで実装する行解析メソッド
   */
  protected abstract parseRow(row: Record<string, string>, index: number): Partial<T> | null;

  /**
   * データ一覧を取得
   */
  async getData(filters: BaseFilters = {}): Promise<T[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const endpoint = params.toString() 
      ? `${this.basePath}?${params.toString()}`
      : this.basePath;
    
    return ApiService.get<T[]>(endpoint);
  }

  /**
   * 特定のデータを取得
   */
  async getItem(id: number): Promise<T> {
    return ApiService.get<T>(`${this.basePath}/${id}`);
  }

  /**
   * CSVファイルをクライアント側で解析（プレビュー用）
   */
  async parseCsv(file: File): Promise<ImportResult<Partial<T>>> {
    return CsvImportService.importCsv(
      file,
      this.importConfig,
      (row, index) => this.parseRow(row, index)
    );
  }

  /**
   * CSVファイルをサーバーにアップロード
   */
  async importCsv(file: File, calculationPeriodId: number = 1): Promise<ImportResponse> {
    const endpoint = `${this.basePath}/import-csv?calculation_period_id=${calculationPeriodId}`;
    return ApiService.uploadFile<ImportResponse>(endpoint, file, 'file');
  }

  /**
   * データを削除
   */
  async deleteItem(id: number): Promise<void> {
    await ApiService.delete(`${this.basePath}/${id}`);
  }

  /**
   * 全てのデータを削除
   */
  async deleteAll(): Promise<{ message: string; deleted_count: number }> {
    return ApiService.delete(`${this.basePath}/`);
  }

  // 共通ユーティリティメソッド（継承クラスで使用可能）
  protected parseAmount = parseAmount;
  protected parseUsageCount = parseUsageCount;
  protected parseDate = parseDate;
}
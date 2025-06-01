/**
 * CSV インポートサービス
 * 各種CSVファイルのインポート処理を統一
 */

import { parseCsvFile, validateCsvData, checkCommonCsvIssues, CsvParseResult } from '@/utils/csvReader';

export interface ImportValidationRule {
  /** 必須カラム */
  requiredColumns: string[];
  /** カラムの別名マッピング */
  columnAliases?: Record<string, string[]>;
  /** カスタム検証関数 */
  customValidation?: (data: Record<string, string>[]) => string[];
}

export interface ImportResult<T = any> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    encoding: string;
  };
}

/**
 * 汎用CSVインポートサービス
 */
export class CsvImportService {
  /**
   * CSVファイルを読み込み、基本的な検証を行う
   */
  static async importCsv<T = Record<string, string>>(
    file: File,
    validationRule: ImportValidationRule,
    transformer?: (row: Record<string, string>, index: number) => T | null
  ): Promise<ImportResult<T>> {
    try {
      // CSVファイルの解析
      const parseResult = await parseCsvFile(file, { skipHeader: true });
      
      // 基本的な問題をチェック
      const commonIssues = checkCommonCsvIssues(parseResult);
      const errors: string[] = [...(parseResult.errors || []), ...commonIssues];
      const warnings: string[] = [];
      
      // ヘッダーの正規化（別名対応）
      const normalizedResult = this.normalizeHeaders(parseResult, validationRule.columnAliases);
      
      // 必須カラムの検証
      const validation = validateCsvData(normalizedResult, validationRule.requiredColumns);
      if (!validation.isValid) {
        errors.push(`必須カラムが不足しています: ${validation.missingColumns.join(', ')}`);
      }
      
      // カスタム検証
      if (validationRule.customValidation) {
        const customErrors = validationRule.customValidation(normalizedResult.data);
        errors.push(...customErrors);
      }
      
      // データの変換
      const transformedData: T[] = [];
      let validRows = 0;
      let errorRows = 0;
      
      normalizedResult.data.forEach((row, index) => {
        try {
          if (transformer) {
            const transformed = transformer(row, index);
            if (transformed !== null) {
              transformedData.push(transformed);
              validRows++;
            } else {
              errorRows++;
              warnings.push(`行 ${index + 2}: データを変換できませんでした`);
            }
          } else {
            transformedData.push(row as unknown as T);
            validRows++;
          }
        } catch (error) {
          errorRows++;
          errors.push(`行 ${index + 2}: ${error instanceof Error ? error.message : '変換エラー'}`);
        }
      });
      
      return {
        success: errors.length === 0,
        data: transformedData,
        errors,
        warnings,
        summary: {
          totalRows: normalizedResult.totalRows,
          validRows,
          errorRows,
          encoding: normalizedResult.encoding
        }
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'インポート処理でエラーが発生しました'],
        warnings: [],
        summary: {
          totalRows: 0,
          validRows: 0,
          errorRows: 0,
          encoding: 'unknown'
        }
      };
    }
  }
  
  /**
   * ヘッダーの正規化（別名対応）
   */
  private static normalizeHeaders(
    result: CsvParseResult,
    columnAliases?: Record<string, string[]>
  ): CsvParseResult {
    if (!columnAliases) return result;
    
    const normalizedHeaders = [...result.headers];
    const normalizedData = result.data.map(row => ({ ...row }));
    
    // 別名のマッピングを適用
    Object.entries(columnAliases).forEach(([standardName, aliases]) => {
      const aliasIndex = normalizedHeaders.findIndex(header => 
        aliases.some(alias => header.toLowerCase().includes(alias.toLowerCase()))
      );
      
      if (aliasIndex !== -1) {
        const originalHeader = normalizedHeaders[aliasIndex];
        normalizedHeaders[aliasIndex] = standardName;
        
        // データも更新
        normalizedData.forEach(row => {
          if (row[originalHeader] !== undefined) {
            row[standardName] = row[originalHeader];
            if (originalHeader !== standardName) {
              delete row[originalHeader];
            }
          }
        });
      }
    });
    
    return {
      ...result,
      headers: normalizedHeaders,
      data: normalizedData
    };
  }
}

/**
 * Freee経費用のインポート設定
 */
export const FREEE_EXPENSE_IMPORT_CONFIG: ImportValidationRule = {
  requiredColumns: [
    '収支区分',
    '取引先',
    '勘定科目',
    '税区分', 
    '金額',
    '税計算区分',
    '税額'
  ],
  columnAliases: {
    '収支区分': ['収支区分', '収支'],
    '管理番号': ['管理番号', '管理No'],
    '発生日': ['発生日', '日付', 'Date'],
    '支払期日': ['支払期日', '支払日'],
    '取引先': ['取引先', '相手先', 'Partner'],
    '勘定科目': ['勘定科目', '科目', 'Account'],
    '税区分': ['税区分', '税'],
    '金額': ['金額', 'Amount', '価格'],
    '税計算区分': ['税計算区分', '税計算'],
    '税額': ['税額', 'Tax'],
    '備考': ['備考', 'Notes', 'メモ'],
    '品目': ['品目', '商品', 'Item'],
    '部門': ['部門', 'Department'],
    '支払日': ['支払日', '決済日'],
    '支払口座': ['支払口座', '口座'],
    '支払金額': ['支払金額', '決済金額']
  },
  customValidation: (data) => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      // 金額の検証
      const amount = row['金額'];
      if (amount && isNaN(Number(amount.replace(/[,円]/g, '')))) {
        errors.push(`行 ${index + 2}: 金額が数値ではありません`);
      }
      
      // 取引先の社員番号形式チェック
      const partner = row['取引先'];
      if (partner && partner.startsWith('★')) {
        const match = partner.match(/★(\d+)/);
        if (!match) {
          errors.push(`行 ${index + 2}: 取引先の社員番号形式が正しくありません`);
        }
      }
    });
    
    return errors;
  }
};

/**
 * 交通費用のインポート設定
 */
export const TRANSPORTATION_IMPORT_CONFIG: ImportValidationRule = {
  requiredColumns: [
    '社員番号',
    '社員名',
    '期間開始',
    '期間終了',
    '利用回数',
    '交通費'
  ],
  columnAliases: {
    '社員番号': ['社員番号', '社員No', 'Employee ID'],
    '社員名': ['社員名', '氏名', 'Name'],
    '期間開始': ['期間開始', '開始日', 'Start Date'],
    '期間終了': ['期間終了', '終了日', 'End Date'],
    '利用回数': ['利用回数', '回数', 'Count'],
    '交通費': ['交通費', '金額', 'Amount'],
    '通勤費': ['通勤費', 'Commute']
  }
};

/**
 * 勤務データ用のインポート設定
 */
export const WORK_DATA_IMPORT_CONFIG: ImportValidationRule = {
  requiredColumns: [
    '社員番号',
    '日付',
    '開始時刻',
    '終了時刻'
  ],
  columnAliases: {
    '社員番号': ['社員番号', '社員No', 'Employee ID'],
    '日付': ['日付', '勤務日', 'Date'],
    '開始時刻': ['開始時刻', '出社時刻', 'Start Time'],
    '終了時刻': ['終了時刻', '退社時刻', 'End Time'],
    '休憩時間': ['休憩時間', '休憩', 'Break'],
    '残業時間': ['残業時間', '残業', 'Overtime']
  }
};

/**
 * Kincone交通費用のインポート設定
 */
export const KINCONE_TRANSPORTATION_IMPORT_CONFIG: ImportValidationRule = {
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
  customValidation: (data) => {
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
import { ExpenseRecord } from '../../lib/types';

/**
 * CSVテキストをパースしてExpenseRecordの配列に変換
 */
export function parseExpenseCSV(csvText: string): ExpenseRecord[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    throw new Error('CSVファイルが空またはヘッダーのみです');
  }

  // ヘッダー行をスキップ（1行目）
  const dataLines = lines.slice(1);
  
  return dataLines.map((line, index) => {
    try {
      // CSVの各列を解析（引用符とカンマの処理）
      const columns = parseCSVLine(line);
      
      if (columns.length < 17) {
        console.warn(`行 ${index + 2}: 列数が不足しています (${columns.length}/17)`);
      }

      return {
        income_expense_category: columns[0] || '',
        management_number: columns[1] || '',
        occurrence_date: columns[2] || '',
        payment_due_date: columns[3] || '',
        business_partner: columns[4] || '',
        account_subject: columns[5] || '',
        tax_category: columns[6] || '',
        amount: parseFloat(columns[7]) || 0,
        tax_calculation_category: columns[8] || '',
        tax_amount: parseFloat(columns[9]) || 0,
        remarks: columns[10] || '',
        item: columns[11] || '',
        department: columns[12] || '',
        memo_tags: columns[13] || '',
        payment_date: columns[14] || '',
        payment_account: columns[15] || '',
        payment_amount: parseFloat(columns[16]) || 0,
      } as ExpenseRecord;
    } catch (error) {
      console.error(`行 ${index + 2} の解析エラー:`, error);
      throw new Error(`行 ${index + 2} でエラーが発生しました: ${error}`);
    }
  });
}

/**
 * CSV行を個別の列に分割（引用符とカンマの適切な処理）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされた引用符
        current += '"';
        i += 2;
      } else {
        // 引用符の開始または終了
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // 列の区切り
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // 最後の列を追加
  result.push(current.trim());
  
  return result;
}

/**
 * Shift_JISエンコーディングのCSVファイルをUTF-8にデコード
 */
export function decodeShiftJIS(buffer: ArrayBuffer): string {
  try {
    // TextDecoderでShift_JISをデコード
    const decoder = new TextDecoder('shift_jis');
    return decoder.decode(buffer);
  } catch (error) {
    console.warn('Shift_JISデコードに失敗、UTF-8でデコードを試行:', error);
    // フォールバック: UTF-8でデコード
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }
}

/**
 * ファイルを読み込んでExpenseRecordの配列に変換
 */
export async function readExpenseCSVFile(file: File): Promise<ExpenseRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        if (!buffer) {
          throw new Error('ファイルの読み込みに失敗しました');
        }

        // Shift_JISからUTF-8に変換
        const csvText = decodeShiftJIS(buffer);
        
        // CSVをパース
        const expenses = parseExpenseCSV(csvText);
        
        resolve(expenses);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込み中にエラーが発生しました'));
    };
    
    // ArrayBufferとして読み込み（エンコーディング処理のため）
    reader.readAsArrayBuffer(file);
  });
}
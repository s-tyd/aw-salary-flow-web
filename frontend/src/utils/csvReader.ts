/**
 * CSV読み込みユーティリティ
 * 文字エンコーディングの自動判定とパースを行う
 */

export interface CsvParseOptions {
  /** ヘッダー行をスキップするか */
  skipHeader?: boolean;
  /** 区切り文字（デフォルト: カンマ） */
  delimiter?: string;
  /** 強制的に使用するエンコーディング */
  forceEncoding?: 'utf-8' | 'shift_jis';
}

export interface CsvParseResult {
  /** パース済みのデータ */
  data: Record<string, string>[];
  /** ヘッダー行（存在する場合） */
  headers: string[];
  /** 使用されたエンコーディング */
  encoding: string;
  /** 総行数 */
  totalRows: number;
  /** エラーメッセージ（存在する場合） */
  errors?: string[];
}

/**
 * ファイルの文字エンコーディングを判定
 */
async function detectEncoding(file: File): Promise<'utf-8' | 'shift_jis'> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // バイト配列から文字エンコーディングを推測
      // Shift-JISの特徴的なバイトパターンをチェック
      let shiftJisScore = 0;
      let utf8Score = 0;
      
      for (let i = 0; i < Math.min(uint8Array.length, 1000); i++) {
        const byte = uint8Array[i];
        
        // Shift-JISの範囲をチェック
        if ((byte >= 0x81 && byte <= 0x9F) || (byte >= 0xE0 && byte <= 0xFC)) {
          shiftJisScore++;
        }
        
        // UTF-8のマルチバイト文字をチェック
        if (byte >= 0xC0 && byte <= 0xFD) {
          utf8Score++;
        }
        
        // ASCII範囲外の文字
        if (byte > 0x7F) {
          // 日本語らしい文字コード範囲
          if (byte >= 0x81 && byte <= 0xFC) {
            shiftJisScore += 0.5;
          }
        }
      }
      
      console.log('エンコーディング判定:', { shiftJisScore, utf8Score });
      
      // スコアに基づいて判定
      if (shiftJisScore > utf8Score) {
        resolve('shift_jis');
      } else {
        resolve('utf-8');
      }
    };
    
    reader.readAsArrayBuffer(file.slice(0, 2048)); // 最初の2KBだけを読み取り
  });
}

/**
 * ファイルを指定されたエンコーディングでテキストとして読み込み
 */
async function readFileAsText(file: File, encoding: 'utf-8' | 'shift_jis'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error(`ファイル読み込みエラー: ${reader.error?.message}`));
    };
    
    if (encoding === 'shift_jis') {
      // Shift-JISでの読み込み
      const arrayBuffer = file.arrayBuffer();
      arrayBuffer.then(buffer => {
        try {
          const decoder = new TextDecoder('shift_jis');
          const text = decoder.decode(buffer);
          resolve(text);
        } catch (error) {
          console.warn('Shift-JIS読み込み失敗、UTF-8で再試行');
          reader.readAsText(file, 'utf-8');
        }
      }).catch(reject);
    } else {
      reader.readAsText(file, 'utf-8');
    }
  });
}

/**
 * CSV文字列をパース
 */
function parseCsvText(
  text: string, 
  options: CsvParseOptions = {}
): { data: Record<string, string>[]; headers: string[]; errors: string[] } {
  const { skipHeader = true, delimiter = ',' } = options; // デフォルトでヘッダーをスキップ
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  const errors: string[] = [];
  
  if (lines.length === 0) {
    return { data: [], headers: [], errors: ['CSVファイルが空です'] };
  }
  
  // ヘッダー行の処理
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine, delimiter);
  
  // データ行の処理（ヘッダー行は常に除外）
  const dataLines = lines.slice(1);
  const data: Record<string, string>[] = [];
  
  dataLines.forEach((line, index) => {
    try {
      const values = parseCSVLine(line, delimiter);
      
      if (values.length !== headers.length) {
        errors.push(`行 ${index + 2}: 列数が一致しません (期待: ${headers.length}, 実際: ${values.length})`);
      }
      
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      data.push(row);
    } catch (error) {
      errors.push(`行 ${index + 2}: ${error instanceof Error ? error.message : 'パースエラー'}`);
    }
  });
  
  return { data, headers, errors };
}

/**
 * CSV行をパース（クォート処理を含む）
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされたクォート
        current += '"';
        i += 2;
      } else {
        // クォートの開始/終了
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // フィールドの区切り
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * CSVファイルを読み込んでパース
 */
export async function parseCsvFile(
  file: File, 
  options: CsvParseOptions = {}
): Promise<CsvParseResult> {
  const { forceEncoding } = options;
  
  try {
    console.log('CSV解析開始:', file.name, `${(file.size / 1024).toFixed(1)}KB`);
    
    // エンコーディングの判定
    const encoding = forceEncoding || await detectEncoding(file);
    console.log('使用エンコーディング:', encoding);
    
    // ファイルの読み込み
    const text = await readFileAsText(file, encoding);
    
    // CSVのパース（オプションを尊重）
    const parseOptions = { skipHeader: true, ...options };
    const { data, headers, errors } = parseCsvText(text, parseOptions);
    
    const result: CsvParseResult = {
      data,
      headers,
      encoding,
      totalRows: data.length,
      errors: errors.length > 0 ? errors : undefined
    };
    
    console.log('CSV解析完了:', {
      rows: result.totalRows,
      columns: headers.length,
      encoding: result.encoding,
      errors: errors.length
    });
    
    return result;
  } catch (error) {
    console.error('CSV解析エラー:', error);
    throw new Error(`CSVファイルの解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

/**
 * CSV読み込み結果の検証
 */
export function validateCsvData(
  result: CsvParseResult,
  requiredColumns: string[]
): { isValid: boolean; missingColumns: string[] } {
  const missingColumns = requiredColumns.filter(
    col => !result.headers.includes(col)
  );
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns
  };
}

/**
 * よくあるCSVエラーのチェック
 */
export function checkCommonCsvIssues(result: CsvParseResult): string[] {
  const issues: string[] = [];
  
  // 空のファイル
  if (result.totalRows === 0) {
    issues.push('CSVファイルにデータが含まれていません');
  }
  
  // ヘッダーのみ
  if (result.totalRows === 1 && result.headers.length > 0) {
    issues.push('ヘッダー行のみでデータ行がありません');
  }
  
  // 重複したヘッダー
  const duplicateHeaders = result.headers.filter(
    (header, index) => result.headers.indexOf(header) !== index
  );
  if (duplicateHeaders.length > 0) {
    issues.push(`重複したヘッダーが見つかりました: ${duplicateHeaders.join(', ')}`);
  }
  
  // 空のヘッダー
  const emptyHeaders = result.headers.filter(header => !header.trim());
  if (emptyHeaders.length > 0) {
    issues.push('空のヘッダーが見つかりました');
  }
  
  return issues;
}
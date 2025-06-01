/**
 * CSV解析共通ユーティリティ関数
 */

/**
 * 金額文字列を数値に変換
 */
export function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '') return 0;
  // カンマと円記号を除去して数値に変換
  const cleanAmount = amountStr.replace(/[,円￥]/g, '');
  const amount = parseFloat(cleanAmount);
  return isNaN(amount) ? 0 : amount;
}

/**
 * 利用回数・件数文字列を数値に変換
 */
export function parseUsageCount(countStr: string): number {
  if (!countStr || countStr.trim() === '') return 1;
  const count = parseInt(countStr);
  return isNaN(count) ? 1 : count;
}

/**
 * 日付文字列をISO形式に変換
 */
export function parseDate(dateStr?: string): string | undefined {
  if (!dateStr || dateStr.trim() === '') return undefined;
  
  try {
    // YYYY/MM/DD, YYYY-MM-DD形式を想定
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD形式
  } catch {
    return undefined;
  }
}

/**
 * CSVの取引先名から社員番号を抽出
 */
export function extractEmployeeNumber(partnerName: string): string | undefined {
  if (!partnerName) return undefined;
  const match = partnerName.match(/★(\d+)/);
  return match ? match[1] : undefined;
}

/**
 * route_infoから交通費と通勤費を抽出
 */
export function extractTransportationFees(routeInfo: string): {
  transportationFee: number;
  commutingFee: number;
} {
  const transportMatch = routeInfo?.match(/交通費: (\d+)円/);
  const commuteMatch = routeInfo?.match(/通勤費: (\d+)円/);
  return {
    transportationFee: transportMatch ? parseInt(transportMatch[1]) : 0,
    commutingFee: commuteMatch ? parseInt(commuteMatch[1]) : 0
  };
}
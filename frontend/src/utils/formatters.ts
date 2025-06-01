/**
 * フォーマット関連のユーティリティ
 */

/**
 * 金額を日本円形式でフォーマット
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
};

/**
 * 日付を日本形式でフォーマット
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ja-JP');
};

/**
 * 社員名を取引先名から抽出
 */
export const extractEmployeeName = (partnerName: string, employeeNumber?: string): string => {
  if (employeeNumber && partnerName) {
    // ★100吉村芙実 から 吉村芙実 を抽出
    const match = partnerName.match(/★\d+(.+)/);
    return match ? match[1] : partnerName;
  }
  return partnerName || '-';
};
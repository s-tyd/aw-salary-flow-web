/**
 * フロントエンド設定
 */

export const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
  isDevelopment,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // 開発モード専用機能フラグ
  features: {
    payrollTest: isDevelopment, // 給与計算デバッグ機能
  }
};

export default config;
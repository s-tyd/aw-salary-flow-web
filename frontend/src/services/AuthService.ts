/**
 * 認証サービス - トークン管理の一元化
 */

export class AuthService {
  private static readonly TOKEN_KEY = 'access_token';

  /**
   * トークンを保存
   */
  static saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * トークンを取得
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * トークンを削除
   */
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * 認証されているかチェック
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * 認証ヘッダーを取得
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * ログアウト処理
   */
  static logout(): void {
    this.removeToken();
    window.location.href = '/login';
  }
}
/**
 * APIサービス - HTTP通信の一元化
 */

import { AuthService } from './AuthService';

export class ApiService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  /**
   * 基本的なfetchラッパー
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...AuthService.getAuthHeaders(),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // 401エラーの場合は自動ログアウト
      if (response.status === 401) {
        AuthService.logout();
        throw new Error('認証エラーが発生しました。再度ログインしてください。');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      console.error('API Request Error:', { 
        url, 
        method: config.method,
        headers: config.headers,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  /**
   * GETリクエスト
   */
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POSTリクエスト
   */
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * FormDataでのPOSTリクエスト
   */
  static async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    const authHeaders = AuthService.getAuthHeaders();
    // Content-Typeヘッダーは削除（ブラウザがFormDataの場合に自動設定）
    const headers = { ...authHeaders };
    delete (headers as any)['Content-Type'];

    const config: RequestInit = {
      method: 'POST',
      headers,
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      // 401エラーの場合は自動ログアウト
      if (response.status === 401) {
        AuthService.logout();
        throw new Error('認証エラーが発生しました。再度ログインしてください。');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      console.error('API FormData Request Error:', { 
        url, 
        headers: config.headers,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  /**
   * PUTリクエスト
   */
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETEリクエスト
   */
  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * ファイルアップロード
   */
  static async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file'
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.postFormData<T>(endpoint, formData);
  }
}
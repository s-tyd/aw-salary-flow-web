import { ApiService } from '@/services/ApiService';
import { AuthService } from '@/services/AuthService';
import { Token, LoginForm } from '../../lib/types';

class AuthAPI {
  async login(credentials: LoginForm): Promise<Token> {
    // OAuth2PasswordRequestFormはFormDataで送信する必要がある
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const result = await ApiService.postFormData<Token>('/token', formData);
    
    // トークンを保存
    AuthService.saveToken(result.access_token);
    
    return result;
  }

  logout(): void {
    AuthService.logout();
  }

  saveToken(token: string): void {
    AuthService.saveToken(token);
  }

  getToken(): string | null {
    return AuthService.getToken();
  }

  isAuthenticated(): boolean {
    return AuthService.isAuthenticated();
  }
}

export const authAPI = new AuthAPI();
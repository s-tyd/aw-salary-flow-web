const API_BASE_URL = typeof window === 'undefined' 
  ? (process.env.API_URL || 'http://localhost:8000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

export class AuthService {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  }

  private static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Login attempt for:', credentials.email);

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.log('Error data:', errorData);
      const errorMessage = errorData?.detail || `ログインに失敗しました (${response.status})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Login successful');
    this.setToken(data.access_token);
    return data;
  }

  static async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      this.removeToken();
      return null;
    }

    return response.json();
  }

  static logout(): void {
    this.removeToken();
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
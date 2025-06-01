// ユーザー関連の型定義

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface UserCreate {
  email: string;
  name: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  password?: string;
}

// 認証関連の型
export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginForm {
  username: string; // OAuth2PasswordRequestFormではusername
  password: string;
}
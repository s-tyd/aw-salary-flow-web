import { ApiClient } from './base';
import { User, UserCreate, UserUpdate } from '../../lib/types';

class UserAPI extends ApiClient {
  async register(userData: UserCreate): Promise<User> {
    return this.post<User>('/register', userData);
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/users/me');
  }

  async getUsers(): Promise<User[]> {
    return this.get<User[]>('/users');
  }

  async getUser(userId: number): Promise<User> {
    return this.get<User>(`/users/${userId}`);
  }

  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    return this.put<User>(`/users/${userId}`, userData);
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/users/${userId}`);
  }
}

export const userAPI = new UserAPI();
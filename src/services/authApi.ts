import { request, setAuthToken, removeAuthToken } from './api.js';
import { AuthResponse, LoginData, RegisterData, User } from '../types/index.js';

export const authApi = {
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const res = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return { user: res.user!, token: res.token! };
  },

  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return { user: res.user!, token: res.token! };
  },

  async getMe(): Promise<User> {
    const res = await request<{ success: boolean; user: User }>('/auth/me');
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      removeAuthToken();
    }
  },
};

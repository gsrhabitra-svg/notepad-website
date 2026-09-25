import { request } from './api.js';
import { SearchResult, User } from '../types/index.js';

export const userApi = {
  async getProfile(): Promise<User> {
    const res = await request<{ success: boolean; data: User }>('/user/profile');
    return res.data;
  },

  async updateProfile(data: {
    fullName?: string;
    mobileNumber?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    const res = await request<{ success: boolean; data: User }>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteAccount(password: string): Promise<void> {
    await request('/user/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },

  async search(query: string): Promise<SearchResult[]> {
    const res = await request<{ success: boolean; data: SearchResult[] }>(
      `/search?q=${encodeURIComponent(query)}`
    );
    return res.data;
  },

  async getDbStatus(): Promise<{ connected: boolean; isAtlas: boolean; readyState: number }> {
    const res = await request<{ success: boolean; data: any }>('/user/status');
    return res.data;
  },
};

import api from './client';
import type { ApiResponse, User } from '../types';

export const authApi = {
  signup: async (data: { name: string; email: string; password: string; avatar?: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/signup', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { name?: string; avatar?: string }) => {
    const res = await api.patch<ApiResponse<User>>('/auth/me', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.post<ApiResponse<null>>('/auth/change-password', data);
    return res.data;
  },
};

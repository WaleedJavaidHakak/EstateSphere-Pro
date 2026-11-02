import api from '@/lib/axios';
import { User } from '@/types';

export const authService = {
  async register(data: { name: string; email: string; password: string; role?: string }) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  async updateProfile(data: FormData | Partial<User>) {
    const isFormData = data instanceof FormData;
    const res = await api.put('/auth/profile', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async updatePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await api.put('/auth/update-password', data);
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(resetToken: string, password: string) {
    const res = await api.put(`/auth/reset-password/${resetToken}`, { password });
    return res.data;
  },
};

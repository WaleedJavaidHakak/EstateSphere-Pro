import api from '@/lib/axios';
import { PropertyFilters } from '@/types';

export const propertyService = {
  async getProperties(filters: PropertyFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        params.append(key, String(val));
      }
    });
    const res = await api.get(`/properties?${params.toString()}`);
    return res.data;
  },

  async getProperty(id: string) {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  },

  async createProperty(data: FormData) {
    const res = await api.post('/properties', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateProperty(id: string, data: FormData) {
    const res = await api.put(`/properties/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteProperty(id: string) {
    const res = await api.delete(`/properties/${id}`);
    return res.data;
  },

  async getMyProperties() {
    const res = await api.get('/properties/my-properties');
    return res.data;
  },

  async deletePropertyImage(propertyId: string, imageId: string) {
    const res = await api.delete(`/properties/${propertyId}/images/${imageId}`);
    return res.data;
  },
};

export const favoriteService = {
  async getFavorites() {
    const res = await api.get('/favorites');
    return res.data;
  },

  async addFavorite(propertyId: string) {
    const res = await api.post('/favorites', { propertyId });
    return res.data;
  },

  async removeFavorite(propertyId: string) {
    const res = await api.delete(`/favorites/${propertyId}`);
    return res.data;
  },
};

export const inquiryService = {
  async sendInquiry(data: {
    propertyId: string;
    message: string;
    name?: string;
    email?: string;
    phone?: string;
  }) {
    const res = await api.post('/inquiries', data);
    return res.data;
  },

  async getInquiries(params?: { status?: string; page?: number; limit?: number }) {
    const res = await api.get('/inquiries', { params });
    return res.data;
  },

  async getMyInquiries() {
    const res = await api.get('/inquiries/my');
    return res.data;
  },

  async updateInquiryStatus(id: string, status: string) {
    const res = await api.put(`/inquiries/${id}`, { status });
    return res.data;
  },
};

export const adminService = {
  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  async getUsers(params?: { role?: string; page?: number; limit?: number; search?: string }) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUser(id: string, data: { role?: string; isActive?: boolean; isApproved?: boolean }) {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },

  async deleteUser(id: string) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  async getAdminProperties(params?: { page?: number; limit?: number; search?: string; isApproved?: boolean }) {
    const res = await api.get('/admin/properties', { params });
    return res.data;
  },

  async approveProperty(id: string, isApproved: boolean) {
    const res = await api.put(`/admin/properties/${id}/approve`, { isApproved });
    return res.data;
  },

  async toggleFeature(id: string) {
    const res = await api.put(`/admin/properties/${id}/feature`);
    return res.data;
  },
};

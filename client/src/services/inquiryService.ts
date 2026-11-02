// services/inquiryService.ts
import api from '@/lib/axios';

export interface Inquiry {
  _id: string;
  property: {
    _id: string;
    title: string;
    images: string[];
    location?: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  agent: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface InquiriesResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  inquiries: Inquiry[];
}

export const inquiryService = {
  // Get inquiries for the agent (agent sees inquiries sent to them)
  async getAgentInquiries(status?: string, page = 1, limit = 10): Promise<InquiriesResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/inquiries?${params.toString()}`);
    return response.data;
  },

  // Update inquiry status
  async updateInquiryStatus(inquiryId: string, status: string): Promise<void> {
    await api.put(`/inquiries/${inquiryId}`, { status });
  },

  // Get user's own inquiries (for regular users)
  async getMyInquiries(): Promise<{ success: boolean; count: number; inquiries: Inquiry[] }> {
    const response = await api.get('/inquiries/my');
    return response.data;
  },

  // Add mark an inquiry as read 
  async markAsRead(inquiryId: string): Promise<void> {
    await api.put(`/inquiries/${inquiryId}/read`);
  },
};
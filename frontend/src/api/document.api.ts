import api from './client';
import type { ApiResponse, Document } from '../types';

export const documentApi = {
  getUserDocuments: async () => {
    const res = await api.get<ApiResponse<Document[]>>('/documents');
    return res.data;
  },

  createDocument: async (data: { title: string; content: string; agentId?: string }) => {
    const res = await api.post<ApiResponse<Document>>('/documents', data);
    return res.data;
  },

  searchKnowledge: async (query: string, topK: number = 3) => {
    const res = await api.get<ApiResponse<Array<{ id: string; score?: number; metadata?: any }>>>(
      `/documents/search?query=${encodeURIComponent(query)}&topK=${topK}`
    );
    return res.data;
  },

  deleteDocument: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/documents/${id}`);
    return res.data;
  },
};

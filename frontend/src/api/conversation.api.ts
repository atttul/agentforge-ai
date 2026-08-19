import api from './client';
import type { ApiResponse, Conversation } from '../types';

export interface StartConversationResponse {
  conversationId: string;
  userMessage?: string | null;
  reply?: string | null;
  contextUsed: boolean;
  conversation: Conversation;
}

export const conversationApi = {
  getUserConversations: async () => {
    const res = await api.get<ApiResponse<Conversation[]>>('/conversations');
    return res.data;
  },

  getConversationById: async (id: string) => {
    const res = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return res.data;
  },

  startConversation: async (data: { agentId: string; title?: string; initialMessage?: string }) => {
    const res = await api.post<ApiResponse<StartConversationResponse>>('/conversations', data);
    return res.data;
  },

  sendMessage: async (id: string, message: string) => {
    const res = await api.post<ApiResponse<{ conversationId: string; reply: string; conversation: Conversation }>>(
      `/conversations/${id}/messages`,
      { message }
    );
    return res.data;
  },

  deleteConversation: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/conversations/${id}`);
    return res.data;
  },
};

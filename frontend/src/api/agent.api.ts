import api from './client';
import type { Agent, ApiResponse } from '../types';

export const agentApi = {
  getUserAgents: async () => {
    const res = await api.get<ApiResponse<Agent[]>>('/agents');
    return res.data;
  },

  getPublicAgents: async () => {
    const res = await api.get<ApiResponse<Agent[]>>('/agents/public');
    return res.data;
  },

  getAgentById: async (id: string) => {
    const res = await api.get<ApiResponse<Agent>>(`/agents/${id}`);
    return res.data;
  },

  createAgent: async (data: {
    name: string;
    description?: string;
    systemPrompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    tools?: string[];
    knowledgeBases?: string[];
    isPublic?: boolean;
  }) => {
    const res = await api.post<ApiResponse<Agent>>('/agents', data);
    return res.data;
  },

  updateAgent: async (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      systemPrompt: string;
      model: string;
      temperature: number;
      maxTokens: number;
      tools: string[];
      knowledgeBases: string[];
      isPublic: boolean;
      status: string;
    }>
  ) => {
    const res = await api.patch<ApiResponse<Agent>>(`/agents/${id}`, data);
    return res.data;
  },

  deleteAgent: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/agents/${id}`);
    return res.data;
  },

  executeAgent: async (id: string, prompt: string) => {
    const res = await api.post<ApiResponse<{ agentId: string; output: string }>>(`/agents/${id}/execute`, { prompt });
    return res.data;
  },
};

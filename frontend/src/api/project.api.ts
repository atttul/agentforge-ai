import api from './client';
import type { ApiResponse, Project } from '../types';

export const projectApi = {
  getUserProjects: async () => {
    const res = await api.get<ApiResponse<Project[]>>('/projects');
    return res.data;
  },

  getProjectById: async (id: string) => {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data;
  },

  createProject: async (data: { name: string; description?: string; agents?: string[]; documents?: string[] }) => {
    const res = await api.post<ApiResponse<Project>>('/projects', data);
    return res.data;
  },

  updateProject: async (id: string, data: { name?: string; description?: string; agents?: string[]; documents?: string[] }) => {
    const res = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data;
  },

  deleteProject: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/projects/${id}`);
    return res.data;
  },
};

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export type AgentStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Agent {
  _id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  knowledgeBases: Document[];
  userId: string;
  isPublic: boolean;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  title: string;
  content: string;
  chunksCount: number;
  vectorIds: string[];
  agentId?: string;
  userId: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface Conversation {
  _id: string;
  agentId: Agent | string;
  userId: string;
  title: string;
  messages: Message[];
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  agents: Agent[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

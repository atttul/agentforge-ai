import { z } from "zod";
import { AgentStatus } from "../models/Agent";

export const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().optional(),
    systemPrompt: z.string().min(5, "System prompt must be at least 5 characters"),
    model: z.string().optional().default("gemini-1.5-flash"),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    maxTokens: z.number().min(64).max(8192).optional().default(2048),
    tools: z.array(z.string()).optional().default([]),
    knowledgeBases: z.array(z.string()).optional().default([]),
    isPublic: z.boolean().optional().default(false),
    status: z.nativeEnum(AgentStatus).optional().default(AgentStatus.ACTIVE),
  }),
});

export const updateAgentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    systemPrompt: z.string().min(5).optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(64).max(8192).optional(),
    tools: z.array(z.string()).optional(),
    knowledgeBases: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
    status: z.nativeEnum(AgentStatus).optional(),
  }),
});

export const getAgentByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>["body"];
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>["body"];

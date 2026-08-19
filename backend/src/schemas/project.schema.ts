import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().optional(),
    agents: z.array(z.string()).optional().default([]),
    documents: z.array(z.string()).optional().default([]),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    agents: z.array(z.string()).optional(),
    documents: z.array(z.string()).optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>["body"];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];

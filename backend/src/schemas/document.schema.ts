import { z } from "zod";

export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200),
    content: z.string().min(10, "Content must be at least 10 characters"),
    agentId: z.string().optional(),
    fileType: z.string().optional().default("text/plain"),
  }),
});

export const searchDocumentSchema = z.object({
  query: z.object({
    query: z.string().min(1, "Search query is required"),
    topK: z.string().optional().default("3"),
  }),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>["body"];

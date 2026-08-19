import { z } from "zod";

export const startConversationSchema = z.object({
  body: z.object({
    agentId: z.string().min(1, "agentId is required"),
    title: z.string().optional().default("New Conversation"),
    initialMessage: z.string().optional(),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Conversation ID is required"),
  }),
  body: z.object({
    message: z.string().min(1, "Message content cannot be empty"),
  }),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>["body"];
export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];

import { conversationRepository } from "../../repositories/conversation/conversation.repository";
import { agentService } from "../agent/agent.service";
import { openRouterService } from "../ai/openrouter.service";
import { geminiService } from "../ai/gemini.service";
import { vectorStoreService } from "../ai/vectorStore.service";
import { StartConversationInput } from "../../schemas/conversation.schema";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";

export class ConversationService {
  async startConversation(userId: string, payload: StartConversationInput) {
    const agent = await agentService.getAgentById(payload.agentId, userId);

    const conversation = await conversationRepository.createConversation({
      agentId: agent._id as any,
      userId: userId as any,
      title: payload.title || `Chat with ${agent.name}`,
      messages: [],
    });

    if (payload.initialMessage) {
      return this.sendMessage(conversation._id.toString(), userId, payload.initialMessage);
    }

    return {
      conversationId: conversation._id.toString(),
      userMessage: null,
      reply: null,
      contextUsed: false,
      conversation,
    };
  }

  async sendMessage(conversationId: string, userId: string, userMessage: string) {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation session not found");
    }

    if (conversation.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Access denied to conversation session");
    }

    const agent: any = conversation.agentId;
    if (!agent) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Associated Agent not found");
    }

    // 1. Save user message to database
    await conversationRepository.addMessage(conversationId, "user", userMessage);

    // 2. Perform RAG Vector Search if knowledge bases linked to user
    let contextString = "";
    try {
      const queryVector = await geminiService.generateEmbedding(userMessage);
      const matches = await vectorStoreService.querySimilarity(queryVector, 3, { userId });
      if (matches && matches.length > 0) {
        contextString = matches
          .map((m) => m.metadata?.text || "")
          .filter((t) => t.length > 0)
          .join("\n---\n");
      }
    } catch (err) {
      // Non-blocking fallback if vector search fails
    }

    // 3. Format history for OpenRouter chat
    const history = conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    // 4. Generate response using OpenRouter AI
    let assistantReply = await openRouterService.runChat(
      history,
      userMessage,
      agent.systemPrompt,
      contextString,
      agent.model || "openrouter/free",
      agent.temperature || 0.7,
      agent.maxTokens || 2048
    );

    if (!assistantReply || assistantReply.trim().length === 0) {
      assistantReply = "I have processed your message successfully.";
    }

    // 5. Append assistant reply to database
    const updatedConversation = await conversationRepository.addMessage(
      conversationId,
      "assistant",
      assistantReply
    );

    return {
      conversationId,
      userMessage,
      reply: assistantReply,
      contextUsed: !!contextString,
      conversation: updatedConversation,
    };
  }

  async getUserConversations(userId: string) {
    return conversationRepository.findUserConversations(userId);
  }

  async getConversationById(id: string, userId: string) {
    const conversation = await conversationRepository.findById(id);
    if (!conversation) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation session not found");
    }
    if (conversation.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Access denied to conversation");
    }
    return conversation;
  }

  async deleteConversation(id: string, userId: string) {
    await this.getConversationById(id, userId);
    await conversationRepository.deleteConversation(id);
    return { message: "Conversation session deleted successfully" };
  }
}

export const conversationService = new ConversationService();

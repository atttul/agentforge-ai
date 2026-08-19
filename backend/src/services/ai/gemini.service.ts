import { getAIClient } from "../../config/ai";
import { logger } from "../../config/logger";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";

export class GeminiService {
  private defaultModel = "gemini-1.5-flash";

  async generateText(
    prompt: string,
    systemInstruction?: string,
    modelName: string = this.defaultModel,
    temperature: number = 0.7
  ): Promise<string> {
    const client = getAIClient();
    if (!client) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Gemini AI client is not configured. Please set GEMINI_API_KEY in backend .env."
      );
    }

    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: temperature,
        },
      });

      return response.text || "";
    } catch (error: any) {
      logger.error({ message: "Gemini AI generation failed", error: error.message });
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Gemini AI execution failed: ${error.message}`
      );
    }
  }

  async runChat(
    history: Array<{ role: "user" | "model" | "assistant" | "system"; content: string }>,
    userMessage: string,
    systemInstruction?: string,
    contextInfo?: string,
    modelName: string = this.defaultModel,
    temperature: number = 0.7
  ): Promise<string> {
    const client = getAIClient();
    if (!client) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Gemini AI client is not configured. Please set GEMINI_API_KEY in backend .env."
      );
    }

    try {
      // Build prompt contents
      let systemPrompt = systemInstruction || "You are a helpful AI Agent.";
      if (contextInfo) {
        systemPrompt += `\n\nRelevant Context from Knowledge Base:\n${contextInfo}`;
      }

      // Convert history to contents format accepted by Google GenAI
      const contents: any[] = history
        .filter((h) => h.role === "user" || h.role === "model" || h.role === "assistant")
        .map((h) => ({
          role: h.role === "assistant" ? "model" : h.role,
          parts: [{ text: h.content }],
        }));

      contents.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      const response = await client.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: temperature,
        },
      });

      return response.text || "";
    } catch (error: any) {
      logger.error({ message: "Gemini AI chat failed", error: error.message });
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Gemini AI chat execution failed: ${error.message}`
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const client = getAIClient();
    if (!client) {
      logger.warn("Gemini client unconfigured, returning dummy vector for embedding.");
      return new Array(768).fill(0);
    }

    try {
      const response: any = await client.models.embedContent({
        model: "text-embedding-004",
        contents: text,
      });

      const embeddingValues = response.embeddings?.[0]?.values || response.embedding?.values;
      return embeddingValues || new Array(768).fill(0);
    } catch (error: any) {
      logger.error({ message: "Embedding generation failed", error: error.message });
      return new Array(768).fill(0);
    }
  }
}

export const geminiService = new GeminiService();

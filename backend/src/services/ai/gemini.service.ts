import { getAIClient } from "../../config/ai";
import { logger } from "../../config/logger";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";

export class GeminiService {
  private defaultModel = "gemini-3.6-flash";

  private normalizeModelName(modelName?: string): string {
    if (!modelName) return this.defaultModel;
    const legacyModels = [
      "gemini-1.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-2.5-pro",
      "gemini-1.0-pro",
    ];
    if (legacyModels.includes(modelName)) {
      return "gemini-3.6-flash";
    }
    return modelName;
  }

  private extractText(response: any): string {
    if (!response) return "";
    if (typeof response.text === "string" && response.text.trim().length > 0) {
      return response.text;
    }
    if (typeof response.text === "function") {
      try {
        const textVal = response.text();
        if (textVal && typeof textVal === "string") return textVal;
      } catch (e) {
        // ignore function invocation error
      }
    }
    const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && typeof candidateText === "string") {
      return candidateText;
    }
    return "";
  }

  private formatChatContents(
    history: Array<{ role: "user" | "model" | "assistant" | "system"; content: string }>,
    userMessage: string
  ): any[] {
    const rawItems: Array<{ role: "user" | "model"; text: string }> = [];

    for (const h of history) {
      if (h.role === "user" || h.role === "model" || h.role === "assistant") {
        const mappedRole: "user" | "model" = h.role === "assistant" ? "model" : (h.role as "user" | "model");
        const text = (h.content || "").trim();
        if (text.length > 0) {
          rawItems.push({ role: mappedRole, text });
        }
      }
    }

    const trimmedUserMsg = (userMessage || "").trim();

    // If last item is not the userMessage, append it
    const lastItem = rawItems[rawItems.length - 1];
    if (!lastItem || lastItem.role !== "user" || lastItem.text !== trimmedUserMsg) {
      if (trimmedUserMsg.length > 0) {
        rawItems.push({ role: "user", text: trimmedUserMsg });
      }
    }

    // Filter to ensure strict alternating user <-> model sequence starting with user
    const cleanedContents: any[] = [];
    let expectedRole: "user" | "model" = "user";

    for (const item of rawItems) {
      if (item.role === expectedRole) {
        cleanedContents.push({
          role: item.role,
          parts: [{ text: item.text }],
        });
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }

    // Fallback: if cleanedContents does not end with user role, force single user message
    if (cleanedContents.length === 0 || cleanedContents[cleanedContents.length - 1].role !== "user") {
      return [{ role: "user", parts: [{ text: trimmedUserMsg || "Hello" }] }];
    }

    return cleanedContents;
  }

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

    const activeModel = this.normalizeModelName(modelName);

    try {
      const response = await client.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: temperature,
        },
      });

      const extracted = this.extractText(response);
      if (extracted) return extracted;
      throw new Error("No text content returned from Gemini API");
    } catch (error: any) {
      logger.error({ message: `Gemini AI generation failed on ${activeModel}`, error: error.message });
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

    const activeModel = this.normalizeModelName(modelName);
    let systemPrompt = systemInstruction || "You are a helpful AI Agent.";
    if (contextInfo) {
      systemPrompt += `\n\nRelevant Context from Knowledge Base:\n${contextInfo}`;
    }

    const contents = this.formatChatContents(history, userMessage);

    try {
      const response = await client.models.generateContent({
        model: activeModel,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: temperature,
        },
      });

      const extracted = this.extractText(response);
      if (extracted) return extracted;
      throw new Error("No chat content returned from Gemini API");
    } catch (error: any) {
      logger.error({ message: `Gemini AI chat failed on ${activeModel}`, error: error.message });
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

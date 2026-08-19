import axios from "axios";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";

export class OpenRouterService {
  private defaultModel = "openrouter/free";
  private apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  private normalizeModelName(_modelName?: string): string {
    // OpenRouter free auto-router slug guarantees fast routing to active free models
    return this.defaultModel;
  }

  private getHeaders() {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in backend .env."
      );
    }

    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.FRONTEND_URL || "http://localhost:5173",
      "X-Title": "AgentForge AI",
    };
  }

  async generateText(
    prompt: string,
    systemInstruction?: string,
    modelName: string = this.defaultModel,
    temperature: number = 0.7,
    maxTokens: number = 2048
  ): Promise<string> {
    const headers = this.getHeaders();
    const activeModel = this.normalizeModelName(modelName);

    const messages: Array<{ role: string; content: string }> = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: activeModel,
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens,
        },
        { headers, timeout: 25000 }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content && typeof content === "string" && content.trim().length > 0) {
        return content.trim();
      }

      throw new Error("No text content returned from OpenRouter API.");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      logger.error({ message: `OpenRouter AI generation failed on ${activeModel}`, error: errorMsg });
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `OpenRouter AI execution failed: ${errorMsg}`
      );
    }
  }

  async runChat(
    history: Array<{ role: "user" | "model" | "assistant" | "system"; content: string }>,
    userMessage: string,
    systemInstruction?: string,
    contextInfo?: string,
    modelName: string = this.defaultModel,
    temperature: number = 0.7,
    maxTokens: number = 2048
  ): Promise<string> {
    const headers = this.getHeaders();
    const activeModel = this.normalizeModelName(modelName);

    let systemPrompt = systemInstruction || "You are a helpful AI Agent.";
    if (contextInfo) {
      systemPrompt += `\n\nRelevant Context from Knowledge Base:\n${contextInfo}`;
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Append history entries
    for (const h of history) {
      if (h.content && h.content.trim().length > 0) {
        const role = h.role === "model" || h.role === "assistant" ? "assistant" : "user";
        messages.push({ role, content: h.content.trim() });
      }
    }

    // Append current user message
    messages.push({ role: "user", content: userMessage.trim() });

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: activeModel,
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens,
        },
        { headers, timeout: 25000 }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content && typeof content === "string" && content.trim().length > 0) {
        return content.trim();
      }

      throw new Error("No text content returned from OpenRouter chat choice.");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      logger.error({ message: `OpenRouter AI chat failed on ${activeModel}`, error: errorMsg });
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `OpenRouter AI chat execution failed: ${errorMsg}`
      );
    }
  }
}

export const openRouterService = new OpenRouterService();

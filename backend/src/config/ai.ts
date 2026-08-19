import { GoogleGenAI } from "@google/genai";
import { env } from "./env";
import { logger } from "./logger";

let aiClient: GoogleGenAI | null = null;

export const getAIClient = (): GoogleGenAI | null => {
  if (!env.GEMINI_API_KEY) {
    logger.warn("GEMINI_API_KEY is not configured in env.");
    return null;
  }

  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      logger.info("✅ Gemini AI client initialized.");
    } catch (error: any) {
      logger.error(`Failed to initialize Gemini AI client: ${error.message}`);
      aiClient = null;
    }
  }

  return aiClient;
};

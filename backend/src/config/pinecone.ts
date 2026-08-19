import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./env";
import { logger } from "./logger";

let pineconeClient: Pinecone | null = null;

export const getPineconeClient = (): Pinecone | null => {
  if (!env.PINECONE_API_KEY) {
    return null;
  }

  if (!pineconeClient) {
    try {
      pineconeClient = new Pinecone({
        apiKey: env.PINECONE_API_KEY,
      });
      logger.info("✅ Pinecone client initialized.");
    } catch (error: any) {
      logger.warn(`Pinecone initialization failed: ${error.message}`);
      pineconeClient = null;
    }
  }

  return pineconeClient;
};

import { getPineconeClient } from "../../config/pinecone";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export class VectorStoreService {
  async upsertVectors(vectors: VectorRecord[]): Promise<boolean> {
    const pinecone = getPineconeClient();
    if (!pinecone || !env.PINECONE_INDEX) {
      logger.warn("Pinecone not configured or index name missing. Skipping vector upsert.");
      return false;
    }

    try {
      const index = pinecone.index(env.PINECONE_INDEX);
      await index.upsert(vectors as any);
      logger.info(`Successfully upserted ${vectors.length} vectors to Pinecone.`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to upsert vectors to Pinecone: ${error.message}`);
      return false;
    }
  }

  async querySimilarity(
    vector: number[],
    topK: number = 3,
    filter?: Record<string, any>
  ): Promise<Array<{ id: string; score?: number; metadata?: Record<string, any> }>> {
    const pinecone = getPineconeClient();
    if (!pinecone || !env.PINECONE_INDEX) {
      logger.warn("Pinecone not configured. Skipping similarity search.");
      return [];
    }

    try {
      const index = pinecone.index(env.PINECONE_INDEX);
      const queryResponse = await index.query({
        vector: vector,
        topK: topK,
        includeMetadata: true,
        filter: filter,
      });

      return queryResponse.matches.map((m) => ({
        id: m.id,
        score: m.score,
        metadata: m.metadata,
      }));
    } catch (error: any) {
      logger.error(`Pinecone query failed: ${error.message}`);
      return [];
    }
  }

  async deleteVectors(ids: string[]): Promise<boolean> {
    const pinecone = getPineconeClient();
    if (!pinecone || !env.PINECONE_INDEX) {
      return false;
    }

    try {
      const index = pinecone.index(env.PINECONE_INDEX);
      await index.deleteMany(ids);
      return true;
    } catch (error: any) {
      logger.error(`Failed to delete vectors from Pinecone: ${error.message}`);
      return false;
    }
  }
}

export const vectorStoreService = new VectorStoreService();

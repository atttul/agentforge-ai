import { documentRepository } from "../../repositories/document/document.repository";
import { CreateDocumentInput } from "../../schemas/document.schema";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";
import { geminiService } from "../ai/gemini.service";
import { vectorStoreService, VectorRecord } from "../ai/vectorStore.service";

export class DocumentService {
  private chunkText(text: string, chunkSize: number = 500): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + chunkSize));
      i += chunkSize;
    }
    return chunks;
  }

  async createDocument(userId: string, payload: CreateDocumentInput) {
    const chunks = this.chunkText(payload.content);
    const vectorRecords: VectorRecord[] = [];
    const vectorIds: string[] = [];

    // Create initial document record
    const document = await documentRepository.createDocument({
      ...payload,
      userId: userId as any,
      agentId: payload.agentId ? (payload.agentId as any) : undefined,
      chunksCount: chunks.length,
      fileSize: Buffer.byteLength(payload.content, "utf8"),
    });

    // Generate embeddings for each chunk
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      const vectorId = `doc_${document._id}_chunk_${index}`;
      const embedding = await geminiService.generateEmbedding(chunk);

      vectorIds.push(vectorId);
      vectorRecords.push({
        id: vectorId,
        values: embedding,
        metadata: {
          documentId: document._id.toString(),
          userId,
          title: payload.title,
          chunkIndex: index,
          text: chunk,
        },
      });
    }

    // Upsert to Pinecone vector store
    await vectorStoreService.upsertVectors(vectorRecords);

    // Update document record with generated vector IDs
    document.vectorIds = vectorIds;
    await document.save();

    return document;
  }

  async getUserDocuments(userId: string) {
    return documentRepository.findUserDocuments(userId);
  }

  async getDocumentById(id: string, userId: string) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Document not found");
    }
    if (document.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Access denied to document");
    }
    return document;
  }

  async deleteDocument(id: string, userId: string) {
    const document = await this.getDocumentById(id, userId);

    if (document.vectorIds && document.vectorIds.length > 0) {
      await vectorStoreService.deleteVectors(document.vectorIds);
    }

    await documentRepository.deleteDocument(id);
    return { message: "Document and vector embeddings deleted successfully" };
  }

  async searchKnowledge(query: string, userId: string, topK: number = 3) {
    const queryVector = await geminiService.generateEmbedding(query);
    const results = await vectorStoreService.querySimilarity(queryVector, topK, { userId });
    return results;
  }
}

export const documentService = new DocumentService();

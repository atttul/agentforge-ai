import DocumentModel, { IDocument } from "../../models/Document";

export class DocumentRepository {
  async createDocument(data: Partial<IDocument>): Promise<IDocument> {
    return DocumentModel.create(data);
  }

  async findUserDocuments(userId: string): Promise<IDocument[]> {
    return DocumentModel.find({ userId }).sort({ updatedAt: -1 });
  }

  async findAgentDocuments(agentId: string): Promise<IDocument[]> {
    return DocumentModel.find({ agentId }).sort({ updatedAt: -1 });
  }

  async findById(id: string): Promise<IDocument | null> {
    return DocumentModel.findById(id);
  }

  async updateDocument(id: string, data: Partial<IDocument>): Promise<IDocument | null> {
    return DocumentModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteDocument(id: string): Promise<IDocument | null> {
    return DocumentModel.findByIdAndDelete(id);
  }
}

export const documentRepository = new DocumentRepository();

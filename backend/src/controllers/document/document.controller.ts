import { Request, Response, NextFunction } from "express";
import { documentService } from "../../services/document/document.service";
import { sendSuccess } from "../../utils/response";
import { StatusCodes } from "../../shared/StatusCodes";

const getParamId = (req: Request): string => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

export class DocumentController {
  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentService.createDocument(req.user!._id.toString(), req.body);
      sendSuccess(res, "Document uploaded and indexed successfully", document, StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getUserDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await documentService.getUserDocuments(req.user!._id.toString());
      sendSuccess(res, "Documents retrieved successfully", documents, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentService.getDocumentById(getParamId(req), req.user!._id.toString());
      sendSuccess(res, "Document retrieved successfully", document, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.deleteDocument(getParamId(req), req.user!._id.toString());
      sendSuccess(res, result.message, null, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async searchKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.query as string;
      const topK = req.query.topK ? parseInt(req.query.topK as string, 10) : 3;

      const results = await documentService.searchKnowledge(query, req.user!._id.toString(), topK);
      sendSuccess(res, "Search results retrieved", results, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();

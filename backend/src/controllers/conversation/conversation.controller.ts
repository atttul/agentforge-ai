import { Request, Response, NextFunction } from "express";
import { conversationService } from "../../services/conversation/conversation.service";
import { sendSuccess } from "../../utils/response";
import { StatusCodes } from "../../shared/StatusCodes";

const getParamId = (req: Request): string => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

export class ConversationController {
  async startConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversation = await conversationService.startConversation(
        req.user!._id.toString(),
        req.body
      );
      sendSuccess(res, "Conversation session started", conversation, StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await conversationService.sendMessage(
        getParamId(req),
        req.user!._id.toString(),
        req.body.message
      );
      sendSuccess(res, "Message processed", result, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async getUserConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await conversationService.getUserConversations(
        req.user!._id.toString()
      );
      sendSuccess(res, "Conversations retrieved", conversations, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async getConversationById(req: Request, res: Response, next: NextFunction) {
    try {
      const conversation = await conversationService.getConversationById(
        getParamId(req),
        req.user!._id.toString()
      );
      sendSuccess(res, "Conversation details retrieved", conversation, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await conversationService.deleteConversation(
        getParamId(req),
        req.user!._id.toString()
      );
      sendSuccess(res, result.message, null, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();

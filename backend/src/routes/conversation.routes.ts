import { Router } from "express";
import { conversationController } from "../controllers/conversation/conversation.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  startConversationSchema,
  sendMessageSchema,
} from "../schemas/conversation.schema";

const router = Router();

router.use(authenticate);

router.post("/", validateRequest(startConversationSchema), conversationController.startConversation);
router.get("/", conversationController.getUserConversations);
router.get("/:id", conversationController.getConversationById);
router.post("/:id/messages", validateRequest(sendMessageSchema), conversationController.sendMessage);
router.delete("/:id", conversationController.deleteConversation);

export default router;

import { Router } from "express";
import { documentController } from "../controllers/document/document.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { createDocumentSchema, searchDocumentSchema } from "../schemas/document.schema";

const router = Router();

router.use(authenticate);

router.post("/", validateRequest(createDocumentSchema), documentController.createDocument);
router.get("/", documentController.getUserDocuments);
router.get("/search", validateRequest(searchDocumentSchema), documentController.searchKnowledge);
router.get("/:id", documentController.getDocumentById);
router.delete("/:id", documentController.deleteDocument);

export default router;

import { Router } from "express";
import { agentController } from "../controllers/agent/agent.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  createAgentSchema,
  updateAgentSchema,
  getAgentByIdSchema,
} from "../schemas/agent.schema";

const router = Router();

router.use(authenticate);

router.post("/", validateRequest(createAgentSchema), agentController.createAgent);
router.get("/", agentController.getUserAgents);
router.get("/public", agentController.getPublicAgents);
router.get("/:id", validateRequest(getAgentByIdSchema), agentController.getAgentById);
router.patch("/:id", validateRequest(updateAgentSchema), agentController.updateAgent);
router.delete("/:id", validateRequest(getAgentByIdSchema), agentController.deleteAgent);
router.post("/:id/execute", agentController.executeAgent);

export default router;

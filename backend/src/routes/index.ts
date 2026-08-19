import { Router } from "express";
import authRoutes from "./auth.routes";
import agentRoutes from "./agent.routes";
import documentRoutes from "./document.routes";
import conversationRoutes from "./conversation.routes";
import projectRoutes from "./project.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/agents", agentRoutes);
router.use("/documents", documentRoutes);
router.use("/conversations", conversationRoutes);
router.use("/projects", projectRoutes);

export default router;
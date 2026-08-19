import { Router } from "express";
import { projectController } from "../controllers/project/project.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema";

const router = Router();

router.use(authenticate);

router.post("/", validateRequest(createProjectSchema), projectController.createProject);
router.get("/", projectController.getUserProjects);
router.get("/:id", projectController.getProjectById);
router.patch("/:id", validateRequest(updateProjectSchema), projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

export default router;

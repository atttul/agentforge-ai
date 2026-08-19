import { Router } from "express";
import { authController } from "../controllers/auth/auth.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../schemas/auth.schema";

const router = Router();

router.post("/signup", validateRequest(signupSchema), authController.signup);
router.post("/login", validateRequest(loginSchema), authController.login);

router.get("/me", authenticate, authController.me);
router.patch("/me", authenticate, validateRequest(updateProfileSchema), authController.updateProfile);
router.post("/change-password", authenticate, validateRequest(changePasswordSchema), authController.changePassword);

export default router;
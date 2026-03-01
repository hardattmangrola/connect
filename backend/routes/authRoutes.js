/**
 * Auth Routes - /api/auth
 */

import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authSchemas } from "../validators/schemas.js";

const router = express.Router();

router.post("/register", validate(authSchemas.register), authController.register);
router.post("/login", validate(authSchemas.login), authController.login);
router.post("/refresh-token", validate(authSchemas.refreshToken), authController.refreshToken);
router.post("/logout", protect, authController.logout);

export default router;

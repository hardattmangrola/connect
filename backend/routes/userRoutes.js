/**
 * User Routes - /api/users
 */

import express from "express";
import * as userController from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import { userSchemas } from "../validators/schemas.js";

const router = express.Router();

router.use(protect);

router.get("/me", userController.getMe);
router.patch(
  "/me",
  upload.single("avatar"),
  validate(userSchemas.updateProfile),
  userController.updateProfile
);
router.get("/search", validate(userSchemas.search, "query"), userController.searchUsers);
router.get("/:id", userController.getUserById);

export default router;

/**
 * Message Routes - /api/messages, /api/conversations
 */

import express from "express";
import * as messageController from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { messageSchemas } from "../validators/schemas.js";

const router = express.Router();

router.use(protect);

router.post(
  "/messages",
  validate(messageSchemas.sendMessage),
  messageController.sendMessage
);
router.post(
  "/messages/read",
  validate(messageSchemas.markAsRead),
  messageController.markAsRead
);
router.get("/conversations", messageController.getConversations);
router.get("/conversations/:id/messages", messageController.getMessages);

export default router;

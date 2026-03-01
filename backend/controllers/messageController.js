/**
 * Message Controller
 */

import asyncHandler from "../utils/asyncHandler.js";
import * as messageService from "../services/messageService.js";
import { emitNewMessage, emitMessageRead } from "../socket/index.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { content, conversationId, recipientId } = req.body;
  const message = await messageService.sendMessage(
    req.userId,
    content,
    conversationId,
    recipientId
  );

  const io = req.app.get("io");
  if (io) {
    const msgObj = message.toObject ? message.toObject() : message;
    emitNewMessage(io, msgObj);
  }

  res.status(201).json({
    success: true,
    message: "Message sent",
    data: { message },
  });
});

export const getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await messageService.getConversations(
    req.userId,
    parseInt(page, 10),
    parseInt(limit, 10)
  );
  res.json({
    success: true,
    data: result,
  });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, before } = req.query;
  const result = await messageService.getMessages(
    req.userId,
    req.params.id,
    {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      before: before || undefined,
    }
  );
  res.json({
    success: true,
    data: result,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId, messageIds } = req.body;
  await messageService.markAsRead(req.userId, conversationId, messageIds);

  const io = req.app.get("io");
  if (io && messageIds?.length) {
    emitMessageRead(io, req.userId, conversationId, messageIds);
  }

  res.json({
    success: true,
    message: "Messages marked as read",
  });
});

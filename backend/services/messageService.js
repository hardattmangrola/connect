/**
 * Message Service
 */

import MessageModel from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import ApiError from "../utils/ApiError.js";

export const getOrCreateConversation = async (userId, recipientId) => {
  if (userId.toString() === recipientId.toString()) {
    throw new ApiError(400, "Cannot start conversation with yourself");
  }
  return Conversation.findOrCreate(userId, recipientId);
};

export const sendMessage = async (senderId, content, conversationId, recipientId) => {
  let conversation;

  if (conversationId) {
    conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId,
    }).populate("participants", "displayName avatar isOnline lastSeen");

    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }
  } else if (recipientId) {
    conversation = await getOrCreateConversation(senderId, recipientId);
  } else {
    throw new ApiError(400, "Either conversationId or recipientId is required");
  }

  const message = await MessageModel.create({
    conversation: conversation._id,
    sender: senderId,
    content,
  });

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: message._id,
    lastMessageAt: message.createdAt,
  });

  return message.populate([
    { path: "sender", select: "displayName avatar" },
    { path: "conversation", populate: { path: "participants", select: "displayName avatar isOnline lastSeen" } },
  ]);
};

export const getMessages = async (userId, conversationId, options = {}) => {
  const { page = 1, limit = 30, before } = options;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  let query = { conversation: conversationId };
  if (before) query.createdAt = { $lt: new Date(before) };

  const messages = await MessageModel.find(query)
    .sort({ createdAt: -1 })
    .skip(before ? 0 : (page - 1) * limit)
    .limit(limit)
    .populate("sender", "displayName avatar")
    .lean();

  messages.reverse();

  const total = await MessageModel.countDocuments({ conversation: conversationId });
  const hasMore = before ? messages.length === limit : page * limit < total;

  return {
    messages,
    pagination: { page, limit, total, hasMore },
  };
};

export const getConversations = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const conversations = await Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("participants", "displayName avatar isOnline lastSeen")
    .populate("lastMessage")
    .lean();

  const total = await Conversation.countDocuments({ participants: userId });

  return {
    conversations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const markAsRead = async (userId, conversationId, messageIds) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  await MessageModel.updateMany(
    {
      _id: { $in: messageIds },
      conversation: conversationId,
      sender: { $ne: userId },
    },
    { $addToSet: { readBy: userId } }
  );

  return { success: true };
};

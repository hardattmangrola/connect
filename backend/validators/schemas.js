/**
 * Joi Validation Schemas
 */

import Joi from "joi";

const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().min(1).max(50).trim().required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const userSchemas = {
  updateProfile: Joi.object({
    displayName: Joi.string().min(1).max(50).trim(),
    about: Joi.string().max(150).trim().allow(""),
  }),
  search: Joi.object({
    q: Joi.string().min(1).max(100).trim().required(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(50),
  }),
};

const messageSchemas = {
  sendMessage: Joi.object({
    content: Joi.string().min(1).max(4096).trim().required(),
    conversationId: Joi.string().hex().length(24),
    recipientId: Joi.string().hex().length(24),
  })
    .or("conversationId", "recipientId")
    .messages({
      "object.missing": "Either conversationId or recipientId is required",
    }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    before: Joi.date().iso(),
  }),
  markAsRead: Joi.object({
    conversationId: Joi.string().hex().length(24).required(),
    messageIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  }),
};

export { authSchemas, userSchemas, messageSchemas };

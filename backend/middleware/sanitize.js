/**
 * Sanitization Middleware
 */

import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

export const applySanitization = (app) => {
  app.use(mongoSanitize());
  app.use(xss());
};

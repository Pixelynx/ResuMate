const { authenticateAdminRequest, adminRateLimit } = require('../middleware/auth');
const { requestLogger } = require('../middleware/logging');

module.exports = app => {
  const admin = require("../controllers/admin.controller.js");
  const router = require("express").Router();

  // Apply middleware to all admin routes
  router.use(requestLogger);
  router.use(adminRateLimit);

  // Health check endpoint (no auth required for monitoring)
  router.get("/health", admin.health);

  // Cleanup endpoint (requires authentication)
  router.post("/cleanup", authenticateAdminRequest, admin.cleanup);

  app.use("/api/admin", router);
}; 
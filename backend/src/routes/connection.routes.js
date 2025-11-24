import express from "express";
import connectionController from "../controllers/connection.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import {
  sendConnectionRequestSchema,
} from "../validators/connection.validator.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Send connection request
router.post(
  "/request",
  validateBody(sendConnectionRequestSchema),
  connectionController.sendConnectionRequest
);

// Get my connections
router.get("/my", connectionController.getMyConnections);

// Get pending connection requests (received)
router.get("/requests/pending", connectionController.getPendingRequests);

// Get sent connection requests
router.get("/requests/sent", connectionController.getSentRequests);

// Get blocked users
router.get("/blocked", connectionController.getBlockedUsers);

// Get connection statistics
router.get("/stats", connectionController.getConnectionStats);

// Accept connection request
router.put("/:id/accept", connectionController.acceptConnectionRequest);

// Reject connection request
router.put("/:id/reject", connectionController.rejectConnectionRequest);

// Unblock user
router.put("/:id/unblock", connectionController.unblockUser);

// Block user
router.post("/block", connectionController.blockUser);

// Remove connection
router.delete("/:id", connectionController.removeConnection);

export default router;

// src/routes/auth.routes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Auth routes:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/logout (protected)
 */

router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);

// Logout is protected; expects Authorization header with access token
router.post("/logout", requireAuth, logoutUser);

export default router;
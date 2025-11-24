// src/middlewares/auth.middleware.js
import { verifyAccessToken } from "../utils/jwt.util.js";

/**
 * Authentication middleware
 * - Expects Authorization: Bearer <accessToken>
 * - Attaches req.user = { userId, role }
 */
export const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Role-based middleware
 * - pass allowed roles e.g. permit("admin", "employer")
 */
export const permit = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  return next();
};
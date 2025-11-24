// src/utils/jwt.util.js
import jwt from "jsonwebtoken";

/**
 * JWT helper
 * - generateAccessToken: JWT token (contains userId + role)
 * - verifyAccessToken: verify access token
 *
 * Keep secrets in env. Access token expiry is configurable.
 */

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "1d";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

// helper to decode without verification (rarely needed)
export const decodeToken = (token) => {
  return jwt.decode(token);
};
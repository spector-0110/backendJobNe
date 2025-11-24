// src/controllers/auth.controller.js
import * as authService from "../services/auth.service.js";
import { success, error } from "../utils/response.util.js";

/**
 * Controller layer: handles HTTP requests/responses and maps to service layer
 */

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });

    return success(
      res,
      {
        userId: result.user._id,
        email: result.user.email,
        role: result.user.role,
        accessToken: result.accessToken,
      },
      "User registered successfully",
      201
    );
  } catch (err) {
    if (err.code === "EMAIL_EXISTS") return error(res, err.message, 400);
    return error(res, err.message, 500);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    return success(
      res,
      {
        userId: result.user._id,
        role: result.user.role,
        accessToken: result.accessToken,
      },
      "Login successful"
    );
  } catch (err) {
    if (err.code === "INVALID_CREDENTIALS") return error(res, "Invalid credentials", 400);
    return error(res, err.message, 500);
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Simple logout - just return success
    // Token expiry is handled by JWT expiration
    return success(res, {}, "Logged out successfully");
  } catch (err) {
    return error(res, err.message, 500);
  }
};
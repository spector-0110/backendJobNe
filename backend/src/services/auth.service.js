// src/services/auth.service.js
import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  updateLastLogin,
  findUserById,
} from "../repositories/user.repository.js";
import { generateAccessToken } from "../utils/jwt.util.js";

/**
 * Auth service encapsulates register/login/refresh/logout logic
 * - Keeps heavy logic out of controllers
 * - Handles token generation & storage
 */

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

export const register = async ({ name, email, password, role }) => {
  // check existing
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("Email is already registered");
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // create user
  const user = await createUser({ name, email, passwordHash, role });

  // generate access token
  const accessToken = generateAccessToken(user);

  // update last login
  await updateLastLogin(user._id);

  return { user, accessToken };
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error("Invalid credentials");
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  // generate access token
  const accessToken = generateAccessToken(user);

  await updateLastLogin(user._id);

  return { user, accessToken };
};


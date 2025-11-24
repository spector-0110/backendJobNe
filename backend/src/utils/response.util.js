// src/utils/response.util.js

export const success = (res, data = {}, message = "ok", status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

export const error = (res, message = "error", status = 400, details = null) => {
  const payload = { success: false, message };
  if (details) payload.error = details;
  return res.status(status).json(payload);
};
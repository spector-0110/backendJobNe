import Joi from "joi";

// Send connection request validation
const sendConnectionRequestSchema = Joi.object({
  receiverId: Joi.string().required().messages({
    "string.empty": "Receiver ID is required",
    "any.required": "Receiver ID is required",
  }),
  message: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Message must not exceed 500 characters",
  }),
});

export {
  sendConnectionRequestSchema,
};

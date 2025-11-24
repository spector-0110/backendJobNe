import Joi from "joi";

// Send message validation
const sendMessageSchema = Joi.object({
  receiverId: Joi.string().required().messages({
    "string.empty": "Receiver ID is required",
    "any.required": "Receiver ID is required",
  }),
  content: Joi.string().min(1).max(5000).required().messages({
    "string.empty": "Message content is required",
    "any.required": "Message content is required",
    "string.min": "Message content cannot be empty",
    "string.max": "Message content must not exceed 5000 characters",
  }),
});

export {
  sendMessageSchema,
};

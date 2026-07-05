import Joi from "joi";

export const sendMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required().messages({
    "any.required": "Vui long nhap noi dung tin nhan",
    "string.empty": "Noi dung tin nhan khong duoc de trong",
  }),
});
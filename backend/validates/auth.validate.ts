import Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.string().min(5).max(50).required().messages({
    "string.empty": "Họ tên không được để trống",
    "string.min": "Họ tên phải có ít nhất 5 ký tự",
    "string.max": "Họ tên không vượt quá 50 ký tự",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email không đúng định dạng",
    "string.empty": "Email không được để trống",
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
      "string.pattern.base":
        "Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
      "string.empty": "Mật khẩu không được để trống",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không đúng định dạng",
    "string.empty": "Email không được để trống",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Mật khẩu không được để trống",
  }),
});
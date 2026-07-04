import Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.string().min(5).max(50).required().messages({
    "string.empty": "Ho ten khong duoc de trong",
    "string.min": "Ho ten phai co it nhat 5 ky tu",
    "string.max": "Ho ten khong vuot qua 50 ky tu",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email khong dung dinh dang",
    "string.empty": "Email khong duoc de trong",
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.min": "Mat khau phai co it nhat 8 ky tu",
      "string.pattern.base":
        "Mat khau phai gom chu hoa, chu thuong, so va ky tu dac biet",
      "string.empty": "Mat khau khong duoc de trong",
    }),
  role: Joi.string().valid("candidate", "company").default("candidate").messages({
    "any.only": "Vai tro khong hop le",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email khong dung dinh dang",
    "string.empty": "Email khong duoc de trong",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Mat khau khong duoc de trong",
  }),
});

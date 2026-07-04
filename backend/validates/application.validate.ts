import Joi from "joi";

export const createApplicationSchema = Joi.object({
  message: Joi.string().allow("").max(2000),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid("new", "interviewing", "offered", "rejected")
    .required()
    .messages({
      "any.only": "Trang thai khong hop le",
      "string.empty": "Trang thai khong duoc de trong",
    }),
});
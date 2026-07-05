import Joi from "joi";

export const createOfferSchema = Joi.object({
  position: Joi.string().trim().min(2).max(150).required().messages({
    "any.required": "Vui long nhap vi tri cong viec trong offer",
    "string.empty": "Vi tri cong viec khong duoc de trong",
  }),
  salary: Joi.string().trim().min(1).max(100).required().messages({
    "any.required": "Vui long nhap muc luong",
    "string.empty": "Muc luong khong duoc de trong",
  }),
  startDate: Joi.date().iso(),
  content: Joi.string().min(10).max(10000).required().messages({
    "any.required": "Vui long nhap noi dung offer letter",
    "string.min": "Noi dung offer letter qua ngan",
  }),
  status: Joi.string().valid("draft", "sent").default("draft"),
});

export const updateOfferSchema = Joi.object({
  position: Joi.string().trim().min(2).max(150),
  salary: Joi.string().trim().min(1).max(100),
  startDate: Joi.date().iso(),
  content: Joi.string().min(10).max(10000),
}).min(1);

export const signOfferSchema = Joi.object({
  candidateSignature: Joi.string().trim().min(2).max(150).required().messages({
    "any.required": "Vui long nhap ho ten de ky nhan offer",
    "string.empty": "Ho ten khong duoc de trong",
  }),
});
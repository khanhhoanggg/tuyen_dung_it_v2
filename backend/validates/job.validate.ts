import Joi from "joi";

export const createJobSchema = Joi.object({
  title: Joi.string().min(3).max(120).required().messages({
    "string.empty": "Ten vi tri khong duoc de trong",
    "string.min": "Ten vi tri phai co it nhat 3 ky tu",
  }),
  company: Joi.string().min(2).max(120).required().messages({
    "string.empty": "Ten cong ty khong duoc de trong",
  }),
  location: Joi.string().min(2).max(120).required().messages({
    "string.empty": "Dia diem khong duoc de trong",
  }),
  salary: Joi.string().min(1).max(60).required().messages({
    "string.empty": "Muc luong khong duoc de trong",
  }),
  level: Joi.string()
    .valid("Intern", "Fresher", "Junior", "Middle", "Senior", "Lead")
    .required(),
  type: Joi.string().valid("Onsite", "Hybrid", "Remote").required(),
  summary: Joi.string().min(10).max(2000).required().messages({
    "string.min": "Mo ta cong viec can it nhat 10 ky tu",
  }),
  skills: Joi.array().items(Joi.string().min(1).max(40)).default([]),
  responsibilities: Joi.array().items(Joi.string().min(1).max(300)).default([]),
  requirements: Joi.array().items(Joi.string().min(1).max(300)).default([]),
  status: Joi.string().valid("open", "closed"),
});

export const updateJobSchema = createJobSchema.fork(
  ["title", "company", "location", "salary", "level", "type", "summary"],
  (schema) => schema.optional()
);

export const jobQuerySchema = Joi.object({
  q: Joi.string().allow("").max(120),
  location: Joi.string().allow("").max(120),
  skill: Joi.string().allow("").max(60),
  level: Joi.string().allow("").max(60),
  type: Joi.string().allow("").max(60),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});
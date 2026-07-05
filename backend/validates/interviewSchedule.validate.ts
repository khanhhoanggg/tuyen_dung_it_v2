import Joi from "joi";

export const createInterviewSchema = Joi.object({
  scheduledAt: Joi.date().iso().required().messages({
    "any.required": "Vui long chon thoi gian phong van",
    "date.base": "Thoi gian phong van khong hop le",
  }),
  durationMinutes: Joi.number().integer().min(5).max(480).default(30),
  type: Joi.string().valid("online", "onsite").default("online"),
  meetingLink: Joi.string().uri().allow("").max(500),
  address: Joi.string().allow("").max(500),
  note: Joi.string().allow("").max(2000),
});

export const updateInterviewSchema = Joi.object({
  scheduledAt: Joi.date().iso(),
  durationMinutes: Joi.number().integer().min(5).max(480),
  type: Joi.string().valid("online", "onsite"),
  meetingLink: Joi.string().uri().allow("").max(500),
  address: Joi.string().allow("").max(500),
  note: Joi.string().allow("").max(2000),
  status: Joi.string().valid("scheduled", "completed", "cancelled", "rescheduled"),
}).min(1);
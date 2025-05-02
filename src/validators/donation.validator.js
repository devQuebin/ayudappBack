import Joi from "joi";
import {
  paramIdSchema,
  validateBody,
  validateParams,
} from "./common.validator.js";

// Esquema para crear donación
const createDonationSchema = Joi.object({
  donorId: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "El donorId debe ser un UUID v4 o un ID de Firestore válido",
      "string.empty": "El donorId es obligatorio",
      "any.required": "El donorId es obligatorio",
    }),
  campaignId: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "El campaignId debe ser un UUID v4 o un ID de Firestore válido",
      "string.empty": "El campaignId es obligatorio",
      "any.required": "El campaignId es obligatorio",
    }),
  date: Joi.date().iso().required().messages({
    "date.base": "La fecha debe ser una fecha válida",
    "any.required": "La fecha es obligatoria",
  }),
  amount: Joi.number().positive().required().messages({
    "number.base": "El monto debe ser un número",
    "number.positive": "El monto debe ser un número positivo",
    "any.required": "El monto es obligatorio",
  }),
}).options({ allowUnknown: false });

// Esquema para update (todos opcionales)
const updateDonationSchema = Joi.object({
  donorId: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .optional()
    .messages({
      "string.pattern.base":
        "El donorId debe ser un UUID v4 o un ID de Firestore válido",
    }),
  campaignId: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .optional()
    .messages({
      "string.pattern.base":
        "El campaignId debe ser un UUID v4 o un ID de Firestore válido",
    }),
  date: Joi.date().iso().optional().messages({
    "date.base": "La fecha debe ser una fecha válida",
  }),
  amount: Joi.number().positive().optional().messages({
    "number.base": "El monto debe ser un número",
    "number.positive": "El monto debe ser un número positivo",
  }),
}).options({ allowUnknown: false });

// Exporta los middlewares listos para usar en rutas
export const validateCreateDonation = validateBody(createDonationSchema);
export const validateUpdateDonation = validateBody(updateDonationSchema);
export const validateParamDonationId = validateParams(
  paramIdSchema("donationId")
);

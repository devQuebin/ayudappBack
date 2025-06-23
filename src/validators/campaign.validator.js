import Joi from "joi";
import {
  paramIdSchema,
  validateBody,
  validateParams,
} from "./common.validator.js";

// Esquema para crear campaña
const createCampaignSchema = Joi.object({
  startDate: Joi.date().iso().required().messages({
    "date.base": "La fecha de inicio debe ser una fecha válida",
    "any.required": "La fecha de inicio es obligatoria",
  }),
  endDate: Joi.date().iso().required().messages({
    "date.base": "La fecha de fin debe ser una fecha válida",
    "any.required": "La fecha de fin es obligatoria",
  }),
  dueDate: Joi.date().iso().required().messages({
    "date.base": "La fecha de vencimiento debe ser una fecha válida",
    "any.required": "La fecha de vencimiento es obligatoria",
  }),
  name: Joi.string().required().messages({
    "string.empty": "El nombre es obligatorio",
    "any.required": "El nombre es obligatorio",
  }),
  description: Joi.string().required().messages({
    "string.empty": "La descripción es obligatoria",
    "any.required": "La descripción es obligatoria",
  }),
  images: Joi.array().items(Joi.string().uri()).optional().messages({
    "string.uri": "Cada imagen debe ser una URL válida",
  }),
  categories: Joi.array().items(Joi.string()).optional(),
  amountTarget: Joi.number().positive().required().messages({
    "number.base": "El objetivo debe ser un número",
    "number.positive": "El objetivo debe ser un número positivo",
    "any.required": "El objetivo es obligatorio",
  }),
  ownerId: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "El ownerId debe ser un UUID v4 o un ID de Firestore válido",
      "string.empty": "El ownerId es obligatorio",
      "any.required": "El ownerId es obligatorio",
    }),
  status: Joi.string()
    .valid("active", "inactive", "completed", "cancelled")
    .required()
    .messages({
      "any.only":
        "El estado debe ser uno de: active, inactive, completed, cancelled",
      "any.required": "El estado es obligatorio",
    }),
}).options({ allowUnknown: false });

// Esquema para update (todos opcionales)
const updateCampaignSchema = Joi.object({
  startDate: Joi.date().iso().optional().messages({
    "date.base": "La fecha de inicio debe ser una fecha válida",
  }),
  endDate: Joi.date().iso().optional().messages({
    "date.base": "La fecha de fin debe ser una fecha válida",
  }),
  dueDate: Joi.date().iso().optional().messages({
    "date.base": "La fecha de vencimiento debe ser una fecha válida",
  }),
  name: Joi.string().optional().messages({
    "string.empty": "El nombre es obligatorio",
  }),
  description: Joi.string().optional().messages({
    "string.empty": "La descripción es obligatoria",
  }),
  images: Joi.array().items(Joi.string().uri()).optional().messages({
    "string.uri": "Cada imagen debe ser una URL válida",
  }),
  categories: Joi.array().items(Joi.string()).optional(),
  amountTarget: Joi.number().positive().optional().messages({
    "number.base": "El objetivo debe ser un número",
    "number.positive": "El objetivo debe ser un número positivo",
  }),
  ownerId: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .optional()
    .messages({
      "string.pattern.base":
        "El ownerId debe ser un UUID v4 o un ID de Firestore válido",
    }),
  status: Joi.string()
    .valid("active", "inactive", "completed", "cancelled")
    .optional()
    .messages({
      "any.only":
        "El estado debe ser uno de: active, inactive, completed, cancelled",
    }),
}).options({ allowUnknown: false });

// Exporta los middlewares listos para usar en rutas
export const validateCreateCampaign = validateBody(createCampaignSchema);
export const validateUpdateCampaign = validateBody(updateCampaignSchema);
export const validateParamCampaignId = validateParams(
  paramIdSchema("campaignId")
);


// Crear get top 3 mas votadas 

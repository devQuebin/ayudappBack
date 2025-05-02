import Joi from "joi";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";

// Esquema para crear campaña
const createCampaignSchema = Joi.object({
  start_date: Joi.date().iso().required().messages({
    "date.base": "La fecha de inicio debe ser una fecha válida",
    "any.required": "La fecha de inicio es obligatoria",
  }),
  end_date: Joi.date().iso().required().messages({
    "date.base": "La fecha de fin debe ser una fecha válida",
    "any.required": "La fecha de fin es obligatoria",
  }),
  due_date: Joi.date().iso().required().messages({
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
  amount_target: Joi.number().positive().required().messages({
    "number.base": "El objetivo debe ser un número",
    "number.positive": "El objetivo debe ser un número positivo",
    "any.required": "El objetivo es obligatorio",
  }),
  owner_id: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "El owner_id debe ser un UUID v4 o un ID de Firestore válido",
      "string.empty": "El owner_id es obligatorio",
      "any.required": "El owner_id es obligatorio",
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
  start_date: Joi.date().iso().optional().messages({
    "date.base": "La fecha de inicio debe ser una fecha válida",
  }),
  end_date: Joi.date().iso().optional().messages({
    "date.base": "La fecha de fin debe ser una fecha válida",
  }),
  due_date: Joi.date().iso().optional().messages({
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
  amount_target: Joi.number().positive().optional().messages({
    "number.base": "El objetivo debe ser un número",
    "number.positive": "El objetivo debe ser un número positivo",
  }),
  owner_id: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .optional()
    .messages({
      "string.pattern.base":
        "El owner_id debe ser un UUID v4 o un ID de Firestore válido",
    }),
  status: Joi.string()
    .valid("active", "inactive", "completed", "cancelled")
    .optional()
    .messages({
      "any.only":
        "El estado debe ser uno de: active, inactive, completed, cancelled",
    }),
}).options({ allowUnknown: false });

// Middleware genérico para validar body
const validateBody =
  (schema, statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY) =>
  (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(statusCode).json({
        errors: error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next();
  };

// Middleware para validar params usando un esquema Joi.
export const paramIdSchema = (paramName) =>
  Joi.object({
    [paramName]: Joi.string()
      .pattern(
        /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
      )
      .required()
      .messages({
        "string.pattern.base": `El ${paramName} debe ser un UUID v4 o un ID de Firestore válido`,
        "string.empty": `El ${paramName} es obligatorio`,
        "any.required": `El ${paramName} es obligatorio`,
      }),
  });

export const validateParams =
  (schema, statusCode = STATUS_CODES.BAD_REQUEST) =>
  (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return res.status(statusCode).json({
        errors: error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next();
  };

// Exporta los middlewares listos para usar en rutas
export const validateCreateCampaign = validateBody(createCampaignSchema);
export const validateUpdateCampaign = validateBody(updateCampaignSchema);
export const validateParamCampaignId = validateParams(paramIdSchema("id"));

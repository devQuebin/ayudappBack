import Joi from "joi";
import {
  paramIdSchema,
  validateBody,
  validateParams,
} from "./common.validator.js";

// Esquema para crear usuario
const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "El nombre es obligatorio",
    "any.required": "El nombre es obligatorio",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "El apellido es obligatorio",
    "any.required": "El apellido es obligatorio",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "El email es inválido",
    "string.empty": "El email es obligatorio",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres",
    "string.empty": "La contraseña es obligatoria",
    "any.required": "La contraseña es obligatoria",
  }),
  campaignRecords: Joi.array().items(Joi.any()).optional(),
  donationRecords: Joi.array().items(Joi.any()).optional(),
}).options({ allowUnknown: false });

// Esquema para update (todos opcionales)
const updateUserSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.empty": "El nombre es obligatorio",
  }),
  lastName: Joi.string().optional().messages({
    "string.empty": "El apellido es obligatorio",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "El email es inválido",
  }),
  password: Joi.string().min(6).optional().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres",
  }),
  campaignRecord: Joi.array().items(Joi.any()).optional(),
  donationRecord: Joi.array().items(Joi.any()).optional(),
}).options({ allowUnknown: false });

// Exporta los middlewares listos para usar en rutas
export const validateCreateUser = validateBody(createUserSchema);
export const validateUpdateUser = validateBody(updateUserSchema);
export const validateParamIDRules = validateParams(paramIdSchema("userId"));

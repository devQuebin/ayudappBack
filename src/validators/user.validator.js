import Joi from "joi";

// Esquema para crear usuario
const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "El nombre es obligatorio",
    "any.required": "El nombre es obligatorio",
  }),
  last_name: Joi.string().required().messages({
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
  campaign_record: Joi.array().items(Joi.any()).optional(),
  donation_record: Joi.array().items(Joi.any()).optional(),
}).options({ allowUnknown: false });

// Esquema para validar param id (como middleware aparte)
const paramIdSchema = Joi.object({
  id: Joi.string()
    .pattern(
      /^([a-zA-Z0-9_-]{20,28}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "El ID debe ser un UUID v4 o un ID de Firestore válido",
      "string.empty": "El ID es obligatorio",
      "any.required": "El ID es obligatorio",
    }),
});

// Esquema para update (todos opcionales)
const updateUserSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.empty": "El nombre es obligatorio",
  }),
  last_name: Joi.string().optional().messages({
    "string.empty": "El apellido es obligatorio",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "El email es inválido",
  }),
  password: Joi.string().min(6).optional().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres",
  }),
  campaign_record: Joi.array().items(Joi.any()).optional(),
  donation_record: Joi.array().items(Joi.any()).optional(),
}).options({ allowUnknown: false });

// Middleware genérico para validar body
const validateBody =
  (schema, statusCode = 422) =>
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

// Middleware para validar params
const validateParams =
  (schema, statusCode = 400) =>
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
export const validateCreateUser = validateBody(createUserSchema, 422);
export const validateUpdateUser = validateBody(updateUserSchema, 422);
export const validateParamIDRules = validateParams(paramIdSchema, 400);

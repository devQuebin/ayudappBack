import Joi from "joi";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";

/**
 * Valida un Firestore ID o UUID v4.
 * @param {string} paramName - Nombre del parámetro a validar.
 * @returns {Joi.ObjectSchema}
 */
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

/**
 * Middleware genérico para validar req.body con un esquema Joi.
 * @param {Joi.ObjectSchema} schema
 * @param {number} [statusCode=STATUS_CODES.UNPROCESSABLE_ENTITY]
 */
export const validateBody =
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

/**
 * Middleware genérico para validar req.params con un esquema Joi.
 * @param {Joi.ObjectSchema} schema
 * @param {number} [statusCode=STATUS_CODES.BAD_REQUEST]
 */
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

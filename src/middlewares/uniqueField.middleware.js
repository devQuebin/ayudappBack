import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../config/firebase_config.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";
/**
 * Middleware para validar la unicidad de un campo en una colección de Firestore.
 * Si el valor ya existe, responde con 409 Conflict.
 *
 * @param {string} collectionName - Nombre de la colección (ej: "user")
 * @param {string} field - Nombre del campo a validar (ej: "email")
 * @returns {Function} Middleware de Express
 *
 * @example
 * router.post(
 *   "/",
 *   uniqueField("user", "email"),
 *   createUser
 * );
 */
export const uniqueField =
  (collectionName, field) => async (req, res, next) => {
    try {
      const value = req.body[field];
      if (!value) {
        return res
          .status(STATUS_CODES.OK)
          .json({ message: `El campo ${field} es obligatorio` });
      }

      const ref = collection(db, collectionName);
      const q = query(ref, where(field, "==", value));
      const existing = await getDocs(q);

      if (!existing.empty) {
        return res
          .status(STATUS_CODES.CONFLICT)
          .json({ message: `El ${field} ya está registrado` });
      }
      next();
    } catch (error) {
      next(error);
    }
  };

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase_config.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";

/**
 * Middleware para validar que un campo (por ejemplo, email) no exista en la colección,
 * excluyendo el documento actual (útil para updates).
 *
 * Si el valor del campo ya existe en otro documento distinto al que se está actualizando,
 * responde con 409 Conflict. Si el campo no se envía en el body, simplemente continúa.
 *
 * @param {string} collectionName - Nombre de la colección de Firestore (ej: "user")
 * @param {string} field - Nombre del campo a validar (ej: "email")
 * @param {string} [paramId="id"] - Nombre del parámetro de la URL que contiene el ID del documento actual (ej: "id")
 * @returns {Function} Middleware de Express asíncrono
 *
 * @example
 * router.put(
 *   "/:id",
 *   fieldDoesntExist("user", "email", "id"),
 *   updateUser
 * );
 */
export const fieldDoesntExist =
  (collectionName, field, paramId = "id") =>
  async (req, res, next) => {
    try {
      const value = req.body[field];
      if (!value) return next();

      const idToExclude = req.params[paramId];
      const ref = collection(db, collectionName);
      const q = query(ref, where(field, "==", value));
      const snapshot = await getDocs(q);

      const exists = snapshot.docs.some((doc) => doc.id !== idToExclude);
      if (exists) {
        return res
          .status(STATUS_CODES.CONFLICT)
          .json({ message: `El ${field} ya está registrado por otro usuario` });
      }
      next();
    } catch (error) {
      next(error);
    }
  };

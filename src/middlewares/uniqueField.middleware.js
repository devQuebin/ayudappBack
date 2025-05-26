import { adminDb } from "../config/firebase_admin_config.js"
import { STATUS_CODES } from "../constants/statusCodes.constants.js"
/**
 * Middleware para validar la unicidad de un campo en una colección de Realtime Database.
 * Si el valor ya existe, responde con 409 Conflict.
 *
 * @param {string} path - Ruta en la base de datos (ej: "users")
 * @param {string} field - Nombre del campo a validar (ej: "email")
 * @returns {Function} Middleware de Express
 *
 * @example
 * router.post(
 *   "/",
 *   uniqueField("users", "email"),
 *   createUser
 * );
 */
export const uniqueField = (path, field) => async (req, res, next) => {
  try {
    const value = req.body[field]
    if (!value) {
      return res
        .status(STATUS_CODES.OK)
        .json({ message: `El campo ${field} es obligatorio` })
    }

    // Usar Admin SDK para consultar
    const dbRef = adminDb.ref(path)
    const snapshot = await dbRef
      .orderByChild(field)
      .equalTo(value)
      .once("value")

    if (snapshot.exists()) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ message: `El ${field} ya está registrado` })
    }
    next()
  } catch (error) {
    console.error("Error en uniqueField middleware:", error)
    next(error)
  }
}

import { adminDb } from "../config/firebase_admin_config.js"
import { STATUS_CODES } from "../constants/statusCodes.constants.js"

/**
 * Middleware para validar que un campo (por ejemplo, email) no exista en la colección,
 * excluyendo el documento actual (útil para updates).
 *
 * Si el valor del campo ya existe en otro documento distinto al que se está actualizando,
 * responde con 409 Conflict. Si el campo no se envía en el body, simplemente continúa.
 *
 * @param {string} path - Ruta en la base de datos (ej: "users")
 * @param {string} field - Nombre del campo a validar (ej: "email")
 * @param {string} [paramId="id"] - Nombre del parámetro de la URL que contiene el ID del documento actual (ej: "id")
 * @returns {Function} Middleware de Express asíncrono
 *
 * @example
 * router.put(
 *   "/:id",
 *   fieldDoesntExist("users", "email", "id"),
 *   updateUser
 * );
 */
export const fieldDoesntExist =
  (path, field, paramId = "id") =>
  async (req, res, next) => {
    try {
      const value = req.body[field]
      if (!value) return next()

      const idToExclude = req.params[paramId]

      // Usar Admin SDK para consultar
      const dbRef = adminDb.ref(path)
      const snapshot = await dbRef
        .orderByChild(field)
        .equalTo(value)
        .once("value")

      // En Realtime Database, los datos vienen como un objeto
      let exists = false
      if (snapshot.exists()) {
        // Verificar si alguno de los registros encontrados tiene un ID diferente al que estamos excluyendo
        const data = snapshot.val()
        exists = Object.keys(data).some((key) => key !== idToExclude)
      }

      if (exists) {
        return res
          .status(STATUS_CODES.CONFLICT)
          .json({ message: `El ${field} ya está registrado por otro usuario` })
      }
      next()
    } catch (error) {
      console.error("Error en fieldDoesntExist middleware:", error)
      next(error)
    }
  }

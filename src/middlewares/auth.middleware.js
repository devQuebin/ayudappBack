// src/middlewares/auth.middleware.js
import { adminAuth } from "../config/firebase_admin_config.js"

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization

  // Verificar si se proporcionó un token
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" })
  }

  // Modo de desarrollo - token especial para bypass de autenticación
  const token = authHeader.split(" ")[1]
  if (token === "devGiveItBack") {
    return next()
  }

  try {
    // Verificar el token usando Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token)

    // Agregar la información del usuario decodificada a la solicitud
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      // Puedes incluir más campos según lo necesites
    }

    return next()
  } catch (error) {
    console.error("Error verifying Firebase token:", error)
    return res.status(401).json({
      message: "Invalid token",
      error: error.message,
    })
  }
}

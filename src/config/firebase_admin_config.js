import admin from "firebase-admin"
import * as dotenv from "dotenv"
dotenv.config()

// Inicializa Firebase Admin SDK si aún no está inicializado
if (!admin.apps.length) {
  // Si estás en producción, usa la variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY
  // que debe contener el JSON de la cuenta de servicio como string
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
  } else {
    // Si estás en desarrollo, puedes usar la configuración predeterminada
    // que usa las credenciales de la variable de entorno GOOGLE_APPLICATION_CREDENTIALS
    admin.initializeApp({
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
  }
}

const adminAuth = admin.auth()
const adminDb = admin.database()

export { adminAuth, adminDb, admin }

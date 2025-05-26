import { ref, set, push, serverTimestamp } from "firebase/database"

// Añade timestamps de creación a un objeto antes de guardarlo en la base de datos
export const addCreatedTimestamps = (data) => {
  return {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

// Genera una referencia con ID único para una colección
export const generateReference = (db, path) => {
  return push(ref(db, path))
}

// Crea un registro con un ID específico
export const createRecord = async (db, path, id, data) => {
  const recordRef = ref(db, `${path}/${id}`)
  const timestampData = addCreatedTimestamps(data)

  try {
    await set(recordRef, timestampData)
    return { id, ref: recordRef }
  } catch (error) {
    console.error("Error creating record:", error)
    throw error
  }
}

// Convierte los timestamps de Realtime Database a formato Date para el cliente
export const formatDatabaseData = (data, id) => {
  if (!data) return null

  // Convertir los timestamps si existen
  const formattedData = { ...data }

  // En Realtime Database, serverTimestamp() crea un objeto de tipo ServerValue
  // Cuando recuperamos los datos, se convierte en un número (timestamp en milisegundos)
  if (formattedData.createdAt) {
    // Si es un número, convertirlo a ISO string
    if (typeof formattedData.createdAt === "number") {
      formattedData.createdAt = new Date(formattedData.createdAt).toISOString()
    }
    // Si sigue siendo un objeto (posiblemente un ServerValue), dejarlo como está
  }

  if (formattedData.updatedAt) {
    if (typeof formattedData.updatedAt === "number") {
      formattedData.updatedAt = new Date(formattedData.updatedAt).toISOString()
    }
  }

  return { id, ...formattedData }
}

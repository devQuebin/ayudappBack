import { adminDb } from "../config/firebase_admin_config.js"

// Añade timestamps de creación a un objeto antes de guardarlo en la base de datos
export const addCreatedTimestamps = (data) => {
  const now = new Date().toISOString()
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  }
}

// Crea un registro con un ID específico usando Admin SDK
export const createRecordAdmin = async (path, id, data) => {
  const dbRef = adminDb.ref(`${path}/${id}`)
  const timestampData = addCreatedTimestamps(data)

  try {
    await dbRef.set(timestampData)
    return { id, ref: dbRef }
  } catch (error) {
    console.error("Error creating record with Admin SDK:", error)
    throw error
  }
}

// Obtiene todos los registros de una ruta usando Admin SDK
export const getAllRecordsAdmin = async (path, filters = {}) => {
  try {
    const dbRef = adminDb.ref(path)
    const snapshot = await dbRef.once("value")

    if (!snapshot.exists()) {
      return []
    }

    const data = snapshot.val()
    const records = []

    // Convertir el objeto a un array con IDs
    Object.keys(data).forEach((key) => {
      const record = formatDatabaseData(data[key], key)

      // Aplicar filtros si existen
      let match = true
      Object.entries(filters).forEach(([field, value]) => {
        if (record[field] !== value) {
          match = false
        }
      })

      if (match) {
        records.push(record)
      }
    })

    return records
  } catch (error) {
    console.error("Error getting records with Admin SDK:", error)
    throw error
  }
}

// Obtiene un registro por ID usando Admin SDK
export const getRecordByIdAdmin = async (path, id) => {
  try {
    const dbRef = adminDb.ref(`${path}/${id}`)
    const snapshot = await dbRef.once("value")

    if (!snapshot.exists()) {
      return null
    }

    return formatDatabaseData(snapshot.val(), id)
  } catch (error) {
    console.error("Error getting record by ID with Admin SDK:", error)
    throw error
  }
}

// Actualiza un registro usando Admin SDK
export const updateRecordAdmin = async (path, id, data) => {
  try {
    const dbRef = adminDb.ref(`${path}/${id}`)
    const snapshot = await dbRef.once("value")

    if (!snapshot.exists()) {
      throw new Error("Record not found")
    }

    // Excluir createdAt si viene en los datos
    const { createdAt, ...fieldsToUpdate } = data

    // Añadir timestamp de actualización
    fieldsToUpdate.updatedAt = new Date().toISOString()

    await dbRef.update(fieldsToUpdate)
    return { id }
  } catch (error) {
    console.error("Error updating record with Admin SDK:", error)
    throw error
  }
}

// Elimina un registro usando Admin SDK
export const deleteRecordAdmin = async (path, id) => {
  try {
    const dbRef = adminDb.ref(`${path}/${id}`)
    const snapshot = await dbRef.once("value")

    if (!snapshot.exists()) {
      throw new Error("Record not found")
    }

    await dbRef.remove()
    return { id }
  } catch (error) {
    console.error("Error deleting record with Admin SDK:", error)
    throw error
  }
}

// Convierte los timestamps de Realtime Database a formato Date para el cliente
export const formatDatabaseData = (data, id) => {
  if (!data) return null

  // Crear una copia para no modificar los datos originales
  const formattedData = { ...data }

  return { id, ...formattedData }
}

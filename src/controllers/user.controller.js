import {
  createRecordAdmin,
  getAllRecordsAdmin,
  getRecordByIdAdmin,
  updateRecordAdmin,
  deleteRecordAdmin,
} from "../utils/admin_database_utils.js"
import { adminAuth } from "../config/firebase_admin_config.js"
import { STATUS_CODES } from "../constants/statusCodes.constants.js"
import { successResponse, errorResponse } from "../utils/response_utils.js"
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "../constants/messages.constants.js"

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { email, password, ...userData } = req.body

    // Crear usuario en Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: false,
    })

    // Crear perfil de usuario en Realtime Database
    const userPath = "users"
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      ...userData,
      campaignRecords: [],
      donationRecords: [],
    }

    await createRecordAdmin(userPath, userRecord.uid, userProfile)

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.CREATE_USER,
      data: { id: userRecord.uid, email: userRecord.email },
      status: STATUS_CODES.CREATED,
    })
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.CREATE_USER, error)
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.CREATE_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Obtener usuarios de Firebase Auth
    const listUsersResult = await adminAuth.listUsers()
    const authUsers = listUsersResult.users

    // Obtener perfiles adicionales de Realtime Database
    const userPath = "users"
    const userProfiles = await getAllRecordsAdmin(userPath)

    // Combinar datos de Firebase Auth con perfiles de la base de datos
    const users = authUsers.map((authUser) => {
      const profile = userProfiles.find((p) => p.id === authUser.uid) || {}
      return {
        id: authUser.uid,
        uid: authUser.uid,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        disabled: authUser.disabled,
        creationTime: authUser.metadata.creationTime,
        lastSignInTime: authUser.metadata.lastSignInTime,
        ...profile, // Incluir datos adicionales del perfil
      }
    })

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.FETCH_USERS,
      data: users,
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.FETCH_USERS, error)
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.FETCH_USERS,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params["userId"]

    // Obtener usuario de Firebase Auth
    const authUser = await adminAuth.getUser(userId)

    // Obtener perfil adicional de Realtime Database
    const userPath = "users"
    const userProfile = await getRecordByIdAdmin(userPath, userId)

    // Combinar datos de Firebase Auth con perfil de la base de datos
    const user = {
      id: authUser.uid,
      uid: authUser.uid,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      disabled: authUser.disabled,
      creationTime: authUser.metadata.creationTime,
      lastSignInTime: authUser.metadata.lastSignInTime,
      ...(userProfile || {}), // Incluir datos adicionales del perfil si existen
    }

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.FETCH_USER,
      data: user,
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return errorResponse(res, {
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      })
    }

    console.error(USER_ERROR_MESSAGES.FETCH_USER, error)
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.FETCH_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params["userId"]
    const userPath = "users"
    const { email, password, ...updateData } = req.body

    // Verificar si el usuario existe en Firebase Auth
    try {
      await adminAuth.getUser(userId)
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return errorResponse(res, {
          message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
          errors: null,
          status: STATUS_CODES.NOT_FOUND,
        })
      }
      throw error
    }

    // Actualizar en Firebase Auth si se proporciona email o password
    if (email || password) {
      const updateAuthData = {}
      if (email) updateAuthData.email = email
      if (password) updateAuthData.password = password

      await adminAuth.updateUser(userId, updateAuthData)
    }

    // Actualizar perfil en Realtime Database (solo si hay datos adicionales)
    if (Object.keys(updateData).length > 0) {
      // Verificar si existe el perfil, si no crearlo
      const existingProfile = await getRecordByIdAdmin(userPath, userId)
      if (!existingProfile) {
        // Crear perfil básico si no existe
        const authUser = await adminAuth.getUser(userId)
        const newProfile = {
          uid: authUser.uid,
          email: authUser.email,
          ...updateData,
          campaignRecords: [],
          donationRecords: [],
        }
        await createRecordAdmin(userPath, userId, newProfile)
      } else {
        await updateRecordAdmin(userPath, userId, updateData)
      }
    }

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.UPDATE_USER,
      data: { id: userId },
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.UPDATE_USER, error)
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.UPDATE_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params["userId"]
    const userPath = "users"

    // Verificar si el usuario existe en Firebase Auth
    try {
      await adminAuth.getUser(userId)
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return errorResponse(res, {
          message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
          errors: null,
          status: STATUS_CODES.NOT_FOUND,
        })
      }
      throw error
    }

    // Eliminar usuario de Firebase Auth
    await adminAuth.deleteUser(userId)

    // Eliminar perfil de Realtime Database (si existe)
    try {
      await deleteRecordAdmin(userPath, userId)
    } catch (error) {
      // Si el perfil no existe en la base de datos, no es un error crítico
      console.warn(
        `Profile not found in database for user ${userId}, but auth user was deleted`
      )
    }

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.DELETE_USER,
      data: { id: userId },
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.DELETE_USER, error)
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.DELETE_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

// Get users by campaign
export const getUsersByCampaign = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"]
    const userPath = "users"

    // Obtener todos los usuarios
    const allUsers = await getAllRecordsAdmin(userPath)
    const users = []

    // Filtrar usuarios que tienen la campaña en sus registros
    allUsers.forEach((user) => {
      if (
        Array.isArray(user.campaignRecords) &&
        user.campaignRecords.includes(campaignId)
      ) {
        users.push(user)
      }
    })

    if (users.length === 0) {
      return errorResponse(res, {
        message: USER_ERROR_MESSAGES.NO_USERS_FOR_CAMPAIGN,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      })
    }

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.FETCH_USERS_BY_CAMPAIGN,
      data: users,
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.FETCH_USERS_BY_CAMPAIGN, error)
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.FETCH_USERS_BY_CAMPAIGN,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

// Get user profile by Firebase Auth token
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid // Obtenido del middleware de autenticación

    // Obtener datos del usuario de Firebase Auth
    const authUser = await adminAuth.getUser(userId)

    // Obtener perfil adicional de Realtime Database
    const userPath = "users"
    const userProfile = await getRecordByIdAdmin(userPath, userId)

    // Combinar datos de Firebase Auth con perfil de la base de datos
    const user = {
      id: authUser.uid,
      uid: authUser.uid,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      disabled: authUser.disabled,
      creationTime: authUser.metadata.creationTime,
      lastSignInTime: authUser.metadata.lastSignInTime,
      // Datos adicionales del perfil (si existen)
      name: userProfile?.name,
      lastName: userProfile?.lastName,
      campaignRecords: userProfile?.campaignRecords || [],
      donationRecords: userProfile?.donationRecords || [],
      createdAt: userProfile?.createdAt,
      updatedAt: userProfile?.updatedAt,
    }

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.FETCH_USER,
      data: user,
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return errorResponse(res, {
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      })
    }

    console.error(USER_ERROR_MESSAGES.FETCH_USER, error)
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.FETCH_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

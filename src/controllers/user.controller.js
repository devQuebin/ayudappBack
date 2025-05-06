import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { addCreatedTimestamps } from "../utils/firestore_utils.js";
import db from "../config/firebase_config.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";
import { successResponse, errorResponse } from "../utils/response_utils.js";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "../constants/messages.constants.js";
import jwt from "jsonwebtoken";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const body = req.body;
    const userRef = collection(db, "user").withConverter(addCreatedTimestamps);
    const docRef = await addDoc(userRef, body);
    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.CREATE_USER,
      data: { id: docRef.id },
      status: STATUS_CODES.CREATED,
    });
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.CREATE_USER, error);
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.CREATE_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const usersRef = collection(db, "user").withConverter(addCreatedTimestamps);
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.FETCH_USERS,
      data: users,
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.FETCH_USERS, error);
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.FETCH_USERS,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params["userId"];
    const docRef = doc(db, "user", userId).withConverter(addCreatedTimestamps);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return successResponse(res, {
        message: USER_SUCCESS_MESSAGES.FETCH_USER,
        data: { id: docSnap.id, ...docSnap.data() },
        status: STATUS_CODES.OK,
      });
    } else {
      return errorResponse(res, {
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.FETCH_USER, error);
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.FETCH_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params["userId"];
    const docRef = doc(db, "user", userId).withConverter(addCreatedTimestamps);
    const body = req.body;

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return errorResponse(res, {
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }

    await updateDoc(docRef, { ...body, updatedAt: serverTimestamp() });
    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.UPDATE_USER,
      data: { id: userId },
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.UPDATE_USER, error);
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.UPDATE_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params["userId"];
    const docRef = doc(db, "user", userId).withConverter(addCreatedTimestamps);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return errorResponse(res, {
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }

    await deleteDoc(docRef);
    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.DELETE_USER,
      data: { id: userId },
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.DELETE_USER, error);
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.DELETE_USER,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get users by campaign
export const getUsersByCampaign = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"];
    const usersRef = collection(db, "user").withConverter(addCreatedTimestamps);
    const querySnapshot = await getDocs(usersRef);
    const users = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        Array.isArray(data.campaignRecord) &&
        data.campaignRecord.includes(campaignId)
      ) {
        users.push({ id: doc.id, ...data });
      }
    });

    if (users.length === 0) {
      return errorResponse(res, {
        message: USER_ERROR_MESSAGES.NO_USERS_FOR_CAMPAIGN,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }

    return successResponse(res, {
      message: USER_SUCCESS_MESSAGES.FETCH_USERS_BY_CAMPAIGN,
      data: users,
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(USER_ERROR_MESSAGES.FETCH_USERS_BY_CAMPAIGN, error);
    return errorResponse(res, {
      message: USER_ERROR_MESSAGES.FETCH_USERS_BY_CAMPAIGN,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca el usuario por email
    const usersRef = collection(db, "user").withConverter(addCreatedTimestamps);
    const querySnapshot = await getDocs(usersRef);
    let user = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === email && data.password === password) {
        user = { id: doc.id, ...data };
      }
    });

    if (!user) {
      return errorResponse(res, {
        message: "Credenciales inválidas",
        errors: null,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    // Genera el token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        // Puedes agregar más campos si lo necesitas, como role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Estructura de usuario a devolver (sin password)
    const userResponse = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      campaignRecords: user.campaignRecords || [],
      donationRecords: user.donationRecords || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(res, {
      message: "Login exitoso",
      data: { token, user: userResponse },
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    return errorResponse(res, {
      message: "Error al hacer login",
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

import db from "../config/firebase_config.js";
import { AUTH_ERROR_MESSAGES, AUTH_SUCCESS_MESSAGES, USER_ERROR_MESSAGES } from "../constants/messages.constants.js";

// Registrar usuario
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (!snapshot.empty) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({ message: AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS });
    }

    await db.collection("users").add({ email, password });

    return res.status(STATUS_CODE.CREATED).json({ message: AUTH_SUCCESS_MESSAGES.REGISTER });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: AUTH_ERROR_MESSAGES.REGISTER, error });
  }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const snapshot = await db.collection("users")
      .where("email", "==", email)
      .where("password", "==", password)
      .get();

    if (snapshot.empty) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: AUTH_ERROR_MESSAGES.CREDENTIALS });
    }

    return res.status(STATUS_CODE.OK).json({ message: AUTH_SUCCESS_MESSAGES.LOGIN });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: AUTH_ERROR_MESSAGES.LOGIN, error });
  }
};


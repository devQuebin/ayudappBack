import { auth, db } from "../config/firebase_config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES
} from "../constants/messages.constants.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";

//Registro de usuario
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    return res.status(STATUS_CODES.CREATED).json({
      message: AUTH_SUCCESS_MESSAGES.REGISTER,
      token,
      uid: userCredential.user.uid
    });
  } catch (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS,
      error: error.message
    });
  }
};

//Inicio de sesión
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    return res.status(STATUS_CODES.OK).json({
      message: AUTH_SUCCESS_MESSAGES.LOGIN,
      token,
      uid: userCredential.user.uid
    });
  } catch (error) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: AUTH_ERROR_MESSAGES.CREDENTIALS,
      error: error.message
    });
  }
};

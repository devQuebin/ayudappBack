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
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { addCreatedTimestamps } from "../utils/firestore_utils.js";
import jwt from "jsonwebtoken";



//Registro de usuario
export const registerUser = async (req, res) => {
  const { name, lastName, email, password } = req.body

  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid
    const token = await userCredential.user.getIdToken()

    // Crear documento en Firestore con ID = uid
    const userRef = doc(db, "user", uid)
    await setDoc(userRef, {
      name,
      lastName,
      email,
      createdAt: new Date()
    })

    return res.status(STATUS_CODES.CREATED).json({
      message: AUTH_SUCCESS_MESSAGES.REGISTER,
      data: {
        id: uid,
        name,
        lastName,
        email,
        token,
        uid
      }
    })
  } catch (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS,
      error: error.message
    })
  }
}

//Inicio de sesión
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Buscar los datos del usuario en Firestore
    const userRef = doc(db, "user", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado en Firestore" });
    }

    const userData = userSnap.data();

    // Crear JWT propio (este sí lo puede verificar isAuthenticated)
    const token = jwt.sign(
      {
        uid,
        email,
        name: userData.name,
        lastName: userData.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        uid,
        email,
        name: userData.name,
        lastName: userData.lastName
      }
    });
  } catch (error) {
    return res.status(401).json({
      message: "Credenciales inválidas",
      error: error.message
    });
  }
};


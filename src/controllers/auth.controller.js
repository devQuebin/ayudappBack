import db from "../config/firebase_config.js";

// Registrar usuario
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    await db.collection('users').add({ email, password });

    return res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar usuario', error });
  }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .where('password', '==', password)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    return res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};


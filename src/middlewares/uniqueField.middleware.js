import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../config/firebase_config.js";

// Middleware genérico para validar unicidad de un campo en Firestore
export const uniqueField =
  (collectionName, field) => async (req, res, next) => {
    try {
      const value = req.body[field];
      if (!value) {
        return res
          .status(400)
          .json({ message: `El campo ${field} es obligatorio` });
      }

      const ref = collection(db, collectionName);
      const q = query(ref, where(field, "==", value));
      const existing = await getDocs(q);

      if (!existing.empty) {
        return res
          .status(409)
          .json({ message: `El ${field} ya está registrado` });
      }
      next();
    } catch (error) {
      next(error);
    }
  };

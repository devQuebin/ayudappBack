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

// Create a new user
export const createUser = async (req, res) => {
  try {
    const body = req.body;
    const userRef = collection(db, "user").withConverter(addCreatedTimestamps);
    const docRef = await addDoc(userRef, body);
    res
      .status(STATUS_CODES.CREATED)
      .json({ message: "User created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Error creating user", error: error.message });
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
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching users" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params["id"];
    const docRef = doc(db, "user", userId).withConverter(addCreatedTimestamps);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.json({ id: docSnap.id, ...docSnap.data() });
    } else {
      res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params["id"];
    const upRef = doc(db, "user", userId).withConverter(addCreatedTimestamps);
    const body = req.body;

    const docSnap = await getDoc(upRef);
    if (!docSnap.exists()) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }

    await updateDoc(upRef, { ...body, updated_at: serverTimestamp() });
    res
      .status(STATUS_CODES.OK)
      .json({ message: "User updated successfully", id: userId });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params["id"];
    const docRef = doc(db, "user", userId).withConverter(addCreatedTimestamps);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }

    await deleteDoc(docRef);
    res
      .status(STATUS_CODES.OK)
      .json({ message: "User deleted successfully", id: userId });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

// Get users by campaign
export const getUsersByCampaign = async (req, res) => {
  try {
    const campaignId = req.params["campaign_record"];
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
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }

    res.status(STATUS_CODES.OK).json(users);
  } catch (error) {
    console.error("Error fetching users by campaign:", error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

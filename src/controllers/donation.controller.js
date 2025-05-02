import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import db from "../config/firebase_config.js";
import { addCreatedTimestamps } from "../utils/firestore_utils.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";

export const getAllDonations = async (req, res) => {
  try {
    const { mes, año } = req.query;
    let donationsRef = collection(db, "donation").withConverter(
      addCreatedTimestamps
    );

    let donations = [];

    if (!mes && !año) {
      const querySnapshot = await getDocs(donationsRef);
      querySnapshot.forEach((doc) => {
        donations.push({ id: doc.id, ...doc.data() });
      });
      return res.json(donations);
    }

    const querySnapshot = await getDocs(donationsRef);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let match = true;
      if (mes && año) {
        match = data.created_at === `${mes} ${año}`;
      } else if (mes) {
        match = data.created_at.startsWith(mes);
      } else if (año) {
        match = data.created_at.endsWith(año);
      }
      if (match) {
        donations.push({ id: doc.id, ...data });
      }
    });

    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

export const getDonationById = async (req, res) => {
  try {
    const donationId = req.params["id"];
    const docRef = doc(db, "donation", donationId).withConverter(
      addCreatedTimestamps
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.json({ id: docSnap.id, ...docSnap.data() });
    } else {
      res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }
  } catch (error) {
    console.error("Error fetching donation:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

export const createDonation = async (req, res) => {
  try {
    const body = req.body;
    const donationRef = collection(db, "donation").withConverter(
      addCreatedTimestamps
    );
    await addDoc(donationRef, body);
    res
      .status(STATUS_CODES.CREATED)
      .json({ message: "donation created successfully", id: donationRef.id });
  } catch (error) {
    console.error("Error creating donation:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error creating donation", error: error.message });
  }
};

export const updateDonation = async (req, res) => {
  try {
    const donationId = req.params["id"];
    const upRef = doc(db, "donation", donationId).withConverter(
      addCreatedTimestamps
    );
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
      .json({ message: "donation updated successfully", id: donationId });
  } catch (error) {
    console.error("Error updating donation:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

export const deleteDonation = async (req, res) => {
  try {
    const donationId = req.params["id"];
    const docRef = doc(db, "donation", donationId).withConverter(
      addCreatedTimestamps
    );

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }

    await deleteDoc(docRef);
    res
      .status(STATUS_CODES.OK)
      .json({ message: "donation deleted successfully", id: donationId });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

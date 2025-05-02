import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { addCreatedTimestamps } from "../utils/firestore_utils.js";
import db from "../config/firebase_config.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";

export const createCampaign = async (req, res) => {
  try {
    const newId = crypto.randomUUID();
    const body = req.body;
    const campaignRef = doc(db, "campaign", newId).withConverter(
      addCreatedTimestamps
    );
    await setDoc(campaignRef, body);
    res
      .status(STATUS_CODES.CREATED)
      .json({ message: "Campaign created successfully", id: campaignRef.id });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error creating campaign", error: error.message });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const campaignRef = collection(db, "campaign");
    const querySnapshot = await getDocs(campaignRef);
    const campaigns = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching campaigns" });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaignId = req.params["id"];
    const docRef = doc(db, "campaign", campaignId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.json({ id: docSnap.id, ...docSnap.data() });
    } else {
      res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaignId = req.params["id"];
    const upRef = doc(db, "campaign", campaignId).withConverter(
      addCreatedTimestamps
    );
    const body = req.body;

    const docSnap = await getDoc(upRef);
    if (!docSnap.exists()) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }

    await updateDoc(upRef, body);
    res
      .status(STATUS_CODES.OK)
      .json({ message: "Campaign updated successfully", id: campaignId });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params["id"];
    const docRef = doc(db, "campaign", campaignId);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
    }

    await deleteDoc(docRef);
    res
      .status(STATUS_CODES.OK)
      .json({ message: "Campaign deleted successfully", id: campaignId });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        `<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`
      );
  }
};

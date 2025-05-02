import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import db from "../config/firebase_config.js";
import { addCreatedTimestamps } from "../utils/firestore_utils.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";
import { successResponse, errorResponse } from "../utils/response_utils.js";
import {
  DONATION_ERROR_MESSAGES,
  DONATION_SUCCESS_MESSAGES,
} from "../constants/messages.constants.js";

export const getAllDonations = async (req, res) => {
  try {
    const { mes, año } = req.query;
    let donationsRef = collection(db, "donation").withConverter(
      addCreatedTimestamps
    );
    let donations = [];

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

    return successResponse(res, {
      message: DONATION_SUCCESS_MESSAGES.FETCH_ALL,
      data: donations,
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(DONATION_ERROR_MESSAGES.FETCH_ALL, error);
    return errorResponse(res, {
      message: DONATION_ERROR_MESSAGES.FETCH_ALL,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
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
      return successResponse(res, {
        message: DONATION_SUCCESS_MESSAGES.FETCH_ONE,
        data: { id: docSnap.id, ...docSnap.data() },
        status: STATUS_CODES.OK,
      });
    } else {
      return errorResponse(res, {
        message: DONATION_ERROR_MESSAGES.NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }
  } catch (error) {
    console.error(DONATION_ERROR_MESSAGES.FETCH_ONE, error);
    return errorResponse(res, {
      message: DONATION_ERROR_MESSAGES.FETCH_ONE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const createDonation = async (req, res) => {
  try {
    const body = req.body;
    const donationRef = collection(db, "donation").withConverter(
      addCreatedTimestamps
    );
    const docRef = await addDoc(donationRef, body);
    return successResponse(res, {
      message: DONATION_SUCCESS_MESSAGES.CREATE,
      data: { id: docRef.id },
      status: STATUS_CODES.CREATED,
    });
  } catch (error) {
    console.error(DONATION_ERROR_MESSAGES.CREATE, error);
    return errorResponse(res, {
      message: DONATION_ERROR_MESSAGES.CREATE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
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
      return errorResponse(res, {
        message: DONATION_ERROR_MESSAGES.NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }

    // Excluir created_at del body si viene del frontend
    const { created_at, ...fieldsToUpdate } = body;

    await updateDoc(upRef, { ...fieldsToUpdate, updated_at: serverTimestamp() });
    return successResponse(res, {
      message: DONATION_SUCCESS_MESSAGES.UPDATE,
      data: { id: donationId },
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(DONATION_ERROR_MESSAGES.UPDATE, error);
    return errorResponse(res, {
      message: DONATION_ERROR_MESSAGES.UPDATE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
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
      return errorResponse(res, {
        message: DONATION_ERROR_MESSAGES.NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }

    await deleteDoc(docRef);
    return successResponse(res, {
      message: DONATION_SUCCESS_MESSAGES.DELETE,
      data: { id: donationId },
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(DONATION_ERROR_MESSAGES.DELETE, error);
    return errorResponse(res, {
      message: DONATION_ERROR_MESSAGES.DELETE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

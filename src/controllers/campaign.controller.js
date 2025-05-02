import {
  collection,
  doc,
  getDoc,
  setDoc,
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
  CAMPAIGN_ERROR_MESSAGES,
  CAMPAIGN_SUCCESS_MESSAGES,
} from "../constants/messages.constants.js";

export const createCampaign = async (req, res) => {
  try {
    const newId = crypto.randomUUID();
    const body = req.body;
    const campaignRef = doc(db, "campaign", newId).withConverter(
      addCreatedTimestamps
    );
    await setDoc(campaignRef, body);
    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.CREATE,
      data: { id: campaignRef.id },
      status: STATUS_CODES.CREATED,
    });
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.CREATE, error);
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.CREATE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const { startMonth, endMonth, campaignStartDate } = req.query;
    const campaignRef = collection(db, "campaign").withConverter(
      addCreatedTimestamps
    );
    const querySnapshot = await getDocs(campaignRef);
    const campaigns = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let match = true;

      // Filtrado por año de campaña (startDate)
      if (campaignStartDate) {
        const startDate = data.startDate ? new Date(data.startDate) : null;
        if (
          !startDate ||
          startDate.getFullYear() !== Number(campaignStartDate)
        ) {
          match = false;
        }
      }

      // Filtrado por mes de inicio
      if (startMonth) {
        const startDate = data.startDate ? new Date(data.startDate) : null;
        if (!startDate || startDate.getMonth() + 1 !== Number(startMonth)) {
          match = false;
        }
      }

      // Filtrado por mes de fin
      if (endMonth) {
        const endDate = data.endDate ? new Date(data.endDate) : null;
        if (!endDate || endDate.getMonth() + 1 !== Number(endMonth)) {
          match = false;
        }
      }

      if (match) {
        campaigns.push({ id: doc.id, ...data });
      }
    });

    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.FETCH_ALL,
      data: campaigns,
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.FETCH_ALL, error);
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.FETCH_ALL,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"];
    const docRef = doc(db, "campaign", campaignId).withConverter(
      addCreatedTimestamps
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return successResponse(res, {
        message: CAMPAIGN_SUCCESS_MESSAGES.FETCH_ONE,
        data: { id: docSnap.id, ...docSnap.data() },
        status: STATUS_CODES.OK,
      });
    } else {
      return errorResponse(res, {
        message: CAMPAIGN_ERROR_MESSAGES.NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.FETCH_ONE, error);
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.FETCH_ONE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"];
    const docRef = doc(db, "campaign", campaignId).withConverter(
      addCreatedTimestamps
    );
    const body = req.body;

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return errorResponse(res, {
        message: CAMPAIGN_ERROR_MESSAGES.NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }

    // Excluir created_at del body si viene del frontend
    const { created_at, ...fieldsToUpdate } = body;

    await updateDoc(docRef, {
      ...fieldsToUpdate,
      updated_at: serverTimestamp(),
    });
    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.UPDATE,
      data: { id: campaignId },
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.UPDATE, error);
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.UPDATE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"];
    const docRef = doc(db, "campaign", campaignId).withConverter(
      addCreatedTimestamps
    );

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return errorResponse(res, {
        message: CAMPAIGN_ERROR_MESSAGES.NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      });
    }

    await deleteDoc(docRef);
    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.DELETE,
      data: { id: campaignId },
      status: STATUS_CODES.OK,
    });
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.DELETE, error);
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.DELETE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

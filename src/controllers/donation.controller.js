import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase_config.js";
import { 
  addCreatedTimestamps,
  updateCampaignDonationStats
} from "../utils/firestore_utils.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";
import { successResponse, errorResponse } from "../utils/response_utils.js";
import {
  DONATION_ERROR_MESSAGES,
  DONATION_SUCCESS_MESSAGES,
} from "../constants/messages.constants.js";

export const getAllDonations = async (req, res) => {
  try {
    const { month, year } = req.query;
    let donationsRef = collection(db, "donation").withConverter(
      addCreatedTimestamps
    );
    let donations = [];

    const querySnapshot = await getDocs(donationsRef);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let match = true;
      if (month || year) {
        if (!data.createdAt) {
          match = false;
        } else {
          const date = new Date(data.createdAt);
          if (month && date.getMonth() + 1 !== Number(month)) {
            match = false;
          }
          if (year && date.getFullYear() !== Number(year)) {
            match = false;
          }
        }
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
    const donationId = req.params["donationId"];
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
    const { campaignId, donorId, amount } = req.body;
    const donationRef = collection(db, "donation").withConverter(addCreatedTimestamps);
    const docRef = await addDoc(donationRef, body);

    // Verificar si es un nuevo donante
    const campaignsRef = collection(db, "donation");
    const q = query(campaignsRef, where("donorId", "==", donorId), where("campaignId", "==", campaignId));
    const querySnapshot = await getDocs(q);

    const isNewDonor = (querySnapshot.size === 1);

    // Actualizar campaña
    await updateCampaignDonationStats(campaignId, amount, isNewDonor);
    
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
    const donationId = req.params["donationId"];
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

    // Excluir createdAt del body si viene del frontend
    const { createdAt, ...fieldsToUpdate } = body;

    await updateDoc(upRef, {
      ...fieldsToUpdate,
      updatedAt: serverTimestamp(),
    });
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
    const donationId = req.params["donationId"];
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

export const getDonationByDonor = async (req, res) => {
  try {
    const donorId = req.params["donorId"];

    const donationsRef = collection(db, "donation");
    const q = query(donationsRef, where("donorId", "==", donorId));
    const querySnapshot = await getDocs(q);

    const donations = [];

    for (const docSnap of querySnapshot.docs) {
      const donationData = docSnap.data();
      const campaignId = donationData.campaignId;

      // Buscar nombre de la campaña
      let campaignName = "Campaña desconocida";
      if (campaignId) {
        const campaignDoc = await getDoc(doc(db, "campaign", campaignId));
        if (campaignDoc.exists()) {
          const campaignData = campaignDoc.data();
          campaignName = campaignData.name || campaignName;
        }
      }

      // Convertir fecha
      const formattedDate = donationData.createdAt?.toDate?.().toISOString() || null;

      donations.push({
        id: docSnap.id,
        amount: donationData.amount,
        date: formattedDate,
        campaignName,
      });
    }

    return successResponse(res, {
      message: DONATION_SUCCESS_MESSAGES.FETCH_ONE,
      data: donations,
      status: STATUS_CODES.OK,
    });

  } catch (error) {
    console.error("Error al obtener donaciones por donorId:", error);
    return errorResponse(res, {
      message: DONATION_ERROR_MESSAGES.FETCH_ONE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

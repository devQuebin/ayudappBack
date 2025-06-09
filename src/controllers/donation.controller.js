import {
  createRecordAdmin,
  getAllRecordsAdmin,
  getRecordByIdAdmin,
  updateRecordAdmin,
  deleteRecordAdmin,
  formatDatabaseData,
} from "../utils/admin_database_utils.js";
import { STATUS_CODES } from "../constants/statusCodes.constants.js";
import { successResponse, errorResponse } from "../utils/response_utils.js";
import {
  DONATION_ERROR_MESSAGES,
  DONATION_SUCCESS_MESSAGES,
} from "../constants/messages.constants.js";
import crypto from "crypto";

export const getAllDonations = async (req, res) => {
  try {
    const { month, year } = req.query;
    const donationPath = "donations";

    // Obtener todas las donaciones usando Admin SDK
    const allDonations = await getAllRecordsAdmin(donationPath);
    const donations = [];

    // Filtrar las donaciones según los criterios
    allDonations.forEach((donation) => {
      let match = true;

      if (month || year) {
        const createdAt = donation.createdAt ? new Date(donation.createdAt) : null;

        if (!createdAt) {
          match = false;
        } else {
          if (month && createdAt.getMonth() + 1 !== Number(month)) {
            match = false;
          }
          if (year && createdAt.getFullYear() !== Number(year)) {
            match = false;
          }
        }
      }

      if (match) {
        donations.push(donation);
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
    const donationPath = "donations";

    // Obtener la donación por ID usando Admin SDK
    const donation = await getRecordByIdAdmin(donationPath, donationId);

    if (donation) {
      return successResponse(res, {
        message: DONATION_SUCCESS_MESSAGES.FETCH_ONE,
        data: donation,
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
    const newId = crypto.randomUUID();
    const body = req.body;
    const donationPath = "donations";

    // Crear el nuevo registro con un ID generado usando Admin SDK
    const result = await createRecordAdmin(donationPath, newId, body);

    return successResponse(res, {
      message: DONATION_SUCCESS_MESSAGES.CREATE,
      data: { id: newId },
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
    const donationPath = "donations";
    const body = req.body;

    // Actualizar la donación usando Admin SDK
    await updateRecordAdmin(donationPath, donationId, body);

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
    const donationPath = "donations";

    // Eliminar la donación usando Admin SDK
    await deleteRecordAdmin(donationPath, donationId);

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

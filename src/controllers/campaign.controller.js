// filepath: c:\Repos\ayudappBack\src\controllers\campaign.controller.js
import {
  createRecordAdmin,
  getAllRecordsAdmin,
  getRecordByIdAdmin,
  updateRecordAdmin,
  deleteRecordAdmin,
  formatDatabaseData,
} from "../utils/admin_database_utils.js"
import { STATUS_CODES } from "../constants/statusCodes.constants.js"
import { successResponse, errorResponse } from "../utils/response_utils.js"
import {
  CAMPAIGN_ERROR_MESSAGES,
  CAMPAIGN_SUCCESS_MESSAGES,
} from "../constants/messages.constants.js"
import crypto from "crypto"

export const createCampaign = async (req, res) => {
  try {

    const newId = crypto.randomUUID()
    const body = req.body
    const campaignPath = "campaigns"

    // Crear el nuevo registro con un ID generado usando Admin SDK
    const result = await createRecordAdmin(campaignPath, newId, body)
    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.CREATE,
      data: { id: newId },
      status: STATUS_CODES.CREATED,
    })
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.CREATE, error)
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.CREATE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

export const getAllCampaigns = async (req, res) => {
  try {
    const { startMonth, endMonth, campaignYear } = req.query
    const campaignPath = "campaigns"

    // Obtener todas las campañas usando Admin SDK
    const allCampaigns = await getAllRecordsAdmin(campaignPath)
    const campaigns = []

    // Filtrar las campañas según los criterios
    allCampaigns.forEach((campaign) => {
      let match = true

      // Filtrado por año de campaña (startDate)
      if (campaignYear) {
        const startDate = campaign.startDate
          ? new Date(campaign.startDate)
          : null
        if (!startDate || startDate.getFullYear() !== Number(campaignYear)) {
          match = false
        }
      }

      // Filtrado por month de inicio
      if (startMonth) {
        const startDate = campaign.startDate
          ? new Date(campaign.startDate)
          : null
        if (!startDate || startDate.getMonth() + 1 !== Number(startMonth)) {
          match = false
        }
      }

      // Filtrado por month de fin
      if (endMonth) {
        const endDate = campaign.endDate ? new Date(campaign.endDate) : null
        if (!endDate || endDate.getMonth() + 1 !== Number(endMonth)) {
          match = false
        }
      }

      if (match) {
        campaigns.push(campaign)
      }
    })

    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.FETCH_ALL,
      data: campaigns,
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.FETCH_ALL, error)
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.FETCH_ALL,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

export const getCampaignById = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"]
    const campaignPath = "campaigns"

    // Obtener la campaña por ID usando Admin SDK
    const campaign = await getRecordByIdAdmin(campaignPath, campaignId)

    if (campaign) {
      return successResponse(res, {
        message: CAMPAIGN_SUCCESS_MESSAGES.FETCH_ONE,
        data: campaign,
        status: STATUS_CODES.OK,
      })
    } else {
      return errorResponse(res, {
        message: CAMPAIGN_ERROR_MESSAGES.NOT_FOUND,
        errors: null,
        status: STATUS_CODES.NOT_FOUND,
      })
    }
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.FETCH_ONE, error)
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.FETCH_ONE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

export const updateCampaign = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"]
    const campaignPath = "campaigns"
    const body = req.body

    // Actualizar la campaña usando Admin SDK
    await updateRecordAdmin(campaignPath, campaignId, body)

    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.UPDATE,
      data: { id: campaignId },
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.UPDATE, error)
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.UPDATE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

export const deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params["campaignId"]
    const campaignPath = "campaigns"

    // Eliminar la campaña usando Admin SDK
    await deleteRecordAdmin(campaignPath, campaignId)

    return successResponse(res, {
      message: CAMPAIGN_SUCCESS_MESSAGES.DELETE,
      data: { id: campaignId },
      status: STATUS_CODES.OK,
    })
  } catch (error) {
    console.error(CAMPAIGN_ERROR_MESSAGES.DELETE, error)
    return errorResponse(res, {
      message: CAMPAIGN_ERROR_MESSAGES.DELETE,
      errors: error.message,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

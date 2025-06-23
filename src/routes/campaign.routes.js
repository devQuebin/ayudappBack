import express from "express"
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaign.controller.js"
import {
  validateCreateCampaign,
  validateParamCampaignId,
  validateUpdateCampaign,
} from "../validators/campaign.validator.js"
import { uniqueField } from "../middlewares/uniqueField.middleware.js"
import { fieldDoesntExist } from "../middlewares/fieldDoesntExist.middleware.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/", getAllCampaigns)

router.get("/:campaignId", validateParamCampaignId, getCampaignById)

router.post(
  "/",
  isAuthenticated,
  validateCreateCampaign,
  uniqueField("campaign", "name"),
  createCampaign
)

router.post(
  "/:campaignId",
  isAuthenticated,
  fieldDoesntExist("campaign", "name"),
  validateUpdateCampaign,
  updateCampaign
)

router.delete("/:campaignId", isAuthenticated, deleteCampaign)

export default router

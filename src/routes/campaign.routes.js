import express from "express";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaign.controller.js";
import {
  validateCreateCampaign,
  validateParamCampaignId,
  validateUpdateCampaign,
} from "../validators/campaign.validator.js";
import { uniqueField } from "../middlewares/uniqueField.middleware.js";
import { fieldDoesntExist } from "../middlewares/fieldDoesntExist.middleware.js";

const router = express.Router();

router.get("/", getAllCampaigns);

router.get("/:campaignId", validateParamCampaignId, getCampaignById);

router.post(
  "/",
  validateCreateCampaign,
  uniqueField("campaign", "name"),
  createCampaign
);

router.put(
  "/:campaignId",
  validateParamCampaignId,
  fieldDoesntExist("campaign", "name"),
  validateUpdateCampaign,
  updateCampaign
);

router.delete("/:campaignId", validateParamCampaignId, deleteCampaign);

export default router;

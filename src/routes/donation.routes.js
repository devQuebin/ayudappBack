import express from "express";
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationByDonor,
} from "../controllers/donation.controller.js";
import {
  validateCreateDonation,
  validateUpdateDonation,
  validateParamDonationId,
} from "../validators/donation.validator.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllDonations);

router.get("/:donationId", validateParamDonationId, getDonationById);

router.get("/by-donor/:donorId", getDonationByDonor);

router.post("/", isAuthenticated, validateCreateDonation, createDonation);

router.put(
  "/:donationId",
  isAuthenticated,
  validateParamDonationId,
  validateUpdateDonation,
  updateDonation
);

router.delete(
  "/:donationId",
  isAuthenticated,
  validateParamDonationId,
  deleteDonation
);

export default router;

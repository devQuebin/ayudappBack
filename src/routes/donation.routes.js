import express from "express";
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} from "../controllers/donation.controller.js";
import {
  validateCreateDonation,
  validateUpdateDonation,
  validateParamDonationId,
} from "../validators/donation.validator.js";

const router = express.Router();

router.get("/", getAllDonations);

router.get("/:donationId", validateParamDonationId, getDonationById);

router.post("/", validateCreateDonation, createDonation);

router.put(
  "/:donationId",
  validateParamDonationId,
  validateUpdateDonation,
  updateDonation
);

router.delete("/:donationId", validateParamDonationId, deleteDonation);

export default router;

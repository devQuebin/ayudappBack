import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByCampaign,
} from "../controllers/user.controller.js";

import {
  validateCreateUser,
  validateParamIDRules,
  validateUpdateUser,
} from "../validators/user.validator.js";

import { uniqueField } from "../middlewares/uniqueField.middleware.js";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);
// Get user by ID
router.get("/:id", validateParamIDRules, getUserById);
// Create a new user
router.post("/", validateCreateUser, uniqueField("user", "email"), createUser);
// Update user by ID
router.put("/:id", validateParamIDRules, validateUpdateUser, updateUser);
// Delete user by ID
router.delete("/:id", validateParamIDRules, deleteUser);
// Get users by campaign ID
router.get("/campaign/:campaignId", validateParamIDRules, getUsersByCampaign);

export default router;

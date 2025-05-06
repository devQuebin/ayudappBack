import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByCampaign,
  loginUser,
} from "../controllers/user.controller.js";

import {
  validateCreateUser,
  validateUpdateUser,
  validateLoginUser,
} from "../validators/user.validator.js";

import {
  paramIdSchema,
  validateParams,
} from "../validators/common.validator.js";

import { uniqueField } from "../middlewares/uniqueField.middleware.js";
import { fieldDoesntExist } from "../middlewares/fieldDoesntExist.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);
// Get user by ID
router.get("/:userId", validateParams(paramIdSchema("userId")), getUserById);
// Create a new user
router.post(
  "/",
  isAuthenticated,
  validateCreateUser,
  uniqueField("user", "email"),
  createUser
);

router.post("/login", validateLoginUser, loginUser);
// Update user by ID
router.put(
  "/:userId",
  isAuthenticated,
  validateParams(paramIdSchema("userId")),
  fieldDoesntExist("user", "email"),
  validateUpdateUser,
  updateUser
);
// Delete user by ID
router.delete(
  "/:userId",
  isAuthenticated,
  validateParams(paramIdSchema("userId")),
  deleteUser
);
// Get users by campaign ID
router.get(
  "/campaign/:campaignId",
  isAuthenticated,
  validateParams(paramIdSchema("campaignId")),
  getUsersByCampaign
);

export default router;

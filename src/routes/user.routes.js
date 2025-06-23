import express from "express"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByCampaign,
  getUserProfile,
} from "../controllers/user.controller.js"

import {
  validateCreateUser,
  validateUpdateUser,
} from "../validators/user.validator.js"

import {
  paramIdSchema,
  validateParams,
} from "../validators/common.validator.js"

import { uniqueField } from "../middlewares/uniqueField.middleware.js"
import { fieldDoesntExist } from "../middlewares/fieldDoesntExist.middleware.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Get all users
router.get("/", getAllUsers)
// Get user by ID
router.get("/:userId", validateParams(paramIdSchema("userId")), getUserById)
// Create a new user
router.post(
  "/",
  isAuthenticated,
  validateCreateUser,
  uniqueField("users", "email"),
  createUser
)

// Get user profile (authenticated user)
router.get("/profile", isAuthenticated, getUserProfile)

// Update user by ID
router.put(
  "/:userId",
  isAuthenticated,
  validateParams(paramIdSchema("userId")),
  fieldDoesntExist("users", "email"),
  validateUpdateUser,
  updateUser
)
// Delete user by ID
router.delete(
  "/:userId",
  isAuthenticated,
  validateParams(paramIdSchema("userId")),
  deleteUser
)
// Get users by campaign ID
router.get(
  "/campaign/:campaignId",
  isAuthenticated,
  validateParams(paramIdSchema("campaignId")),
  getUsersByCampaign
)

export default router

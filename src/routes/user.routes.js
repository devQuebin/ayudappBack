import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUsersByCampaign } from '../controllers/user.controller.js';


const router = express.Router();


// Get all users
router.get('/', getAllUsers);
// Get user by ID
router.get('/:id', getUserById);
// Create a new user
router.post('/', createUser);
// Update user by ID
router.put('/:id', updateUser);
// Delete user by ID
router.delete('/:id', deleteUser);
// Get users by campaign ID
router.get('/campaign/:campaignId', getUsersByCampaign);



export default router;
import express from "express";
import {
    createUser,
    updateUser,
    deleteUser,
    getAllUser,
    getUserById,
    searchUsers ,
} from '../controllers/userController.js';
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/', getAllUser);
router.get('/:id', getUserById)

export default router;
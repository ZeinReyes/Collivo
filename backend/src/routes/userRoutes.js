import express from "express";
import {
    createUser,
    updateUser,
    deleteUser,
    getAllUser,
    getUserById,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/', getAllUser);
router.get('/:id', getUserById)

export default router;
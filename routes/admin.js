import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { registerUser } from "../controllers/User/auth.js";
import {
    deleteUser,
    getAllUsers,
    updateRole,
    updateStatus,
} from "../controllers/User/details.js";
const router = express.Router();

router.post("/register", authorizeRoles("admin"), registerUser);

router.get("/users",getAllUsers);

router.put("/user/details", authorizeRoles("admin"), updateRole);
router.delete("/user/delete/:userId", authorizeRoles("admin"), deleteUser);
router.put("/user/status", authorizeRoles("admin"), updateStatus);

export default router;

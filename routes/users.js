import express from "express";
import {
    forgotPassword,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
} from "../controllers/User/auth.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {
    getAllUsers,
    getUserDetails,
    updateDetails,
    updatePassword,
} from "../controllers/User/details.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/forgot/password", forgotPassword);
router.post("/password/reset/:token", resetPassword);

router.get("/details", isAuthenticatedUser, getUserDetails);
router.put("/details/update", isAuthenticatedUser, updateDetails);
router.put("/password/update", isAuthenticatedUser, updatePassword);

export default router;

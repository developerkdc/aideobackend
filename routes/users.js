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
import multer from "multer";

const router = express.Router();
import fs from "fs";

// Create a multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = "profile-pics";
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath);
    }
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    console.log(file)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = "jpg"; // Set the desired file extension
    const filename = `thumbnail-${req.user.id}.${ext}`;
    const relativePath = `${filename}`; // Generate the relative path
    cb(null, relativePath);
  },
});

// Create a multer upload instance
const upload = multer({ storage });

router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/forgot/password", forgotPassword);
router.post("/password/reset/:token", resetPassword);

router.get("/details", isAuthenticatedUser, getUserDetails);
router.put(
  "/details/update",
  isAuthenticatedUser,
  upload.single("thumbnail"),
  updateDetails
);
router.put("/password/update", isAuthenticatedUser, updatePassword);

export default router;

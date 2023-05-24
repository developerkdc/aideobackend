import express from "express";
import { authorizeRoles } from "../middlewares/auth.js";
import {
    addLanguage,
    deleteLanguage,
    editLanguage,
    getLanguage,
} from "../controllers/Language/language.js";

const router = express.Router();

router.post("/", authorizeRoles("admin", "manager"), addLanguage);
router.get("/", getLanguage);
router.patch("/:id", authorizeRoles("admin", "manager"), editLanguage);
router.delete("/:id", authorizeRoles("admin", "manager"), deleteLanguage);

export default router;

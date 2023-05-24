import express from "express";
import { addTag, deleteTag, editTag, getAllTags } from "../controllers/Tag/tag.js";

const router = express.Router();

router.post("/", addTag);
router.get("/", getAllTags);
router.patch("/:id", editTag);
router.delete("/:id", deleteTag);

export default router;

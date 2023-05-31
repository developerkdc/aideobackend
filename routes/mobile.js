import express from "express";
import { addLog } from "../controllers/Log/log.js";
import { getAllTopicByCity } from "../controllers/Topic/topic.js";
import { getContentByCity, getContentById } from "../controllers/Content/content.js";

const router = express.Router();

//Logs
router.post("/logs", addLog);

//Topics
router.get("/topic/:city", getAllTopicByCity);

//Content
router.get("/content/:id",getContentById)
router.get("/content/place/:city",getContentByCity)

export default router;

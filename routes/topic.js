import express from "express";
import { authorizeRoles } from "../middlewares/auth.js";
import {
    addTopic,
    addTopicContent,
    arrangeTopic,
    deleteTopic,
    editTopic,
    getAllTopics,
    updateTopicStatus,
} from "../controllers/Topic/topic.js";

const router = express.Router();

router.post("/", authorizeRoles("admin", "manager"), addTopic);
router.get("/", authorizeRoles("admin", "manager"), getAllTopics);
router.get(
    "/position/:oldpos/:position",
    authorizeRoles("admin", "manager"),
    arrangeTopic
);
router.put("/status", authorizeRoles("admin", "manager"), updateTopicStatus);
router.delete("/:id", authorizeRoles("admin", "manager"), deleteTopic);
router.patch("/edit/:id", authorizeRoles("admin", "manager"), editTopic);
router.patch(
    "/addContent/:topicId",
    authorizeRoles("admin", "manager"),
    addTopicContent
);
export default router;

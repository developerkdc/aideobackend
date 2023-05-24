import express from "express";
const router = express.Router();
import multer from "multer";
import {
    addContent,
    allocateUserToVerify,
    getAllContent,
    getContentByCreatorId,
    getContentByTags,
    getContentByTopic,
    myContentsToVerify,
    updateContentLiveStatus,
    updateContentVerifyStatus,
    uploadFiles,
} from "../controllers/Content/content.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const name = file.originalname;
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        if (file.fieldname == "zipFile") {
            cb(null, name);
        } else if (file.fieldname == "imageFile") {
            const name = file.originalname.split(".");
            console.log(name);
            cb(null, file.fieldname + "-" + uniqueSuffix + "." + name[1]);
        }
    },
});

const upload = multer({ storage });

router.post("/", addContent);
router.get("/", authorizeRoles("admin"), getAllContent);
router.get("/mycontent", getContentByCreatorId);
router.post("/status", updateContentVerifyStatus);
router.post("/live", updateContentLiveStatus);
router.get("/verify/mycontent", myContentsToVerify);
router.patch("/allocate/:contentId", allocateUserToVerify);
router.post(
    "/upload",
    upload.fields([{ name: "zipFile" }, { name: "imageFile" }]),
    uploadFiles
);
router.post("/tags", getContentByTags);
router.get("/:topicId", getContentByTopic);

export default router;

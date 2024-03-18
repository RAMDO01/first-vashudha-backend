import express from "express";
import {
    uploadVideo, 
    deleteVideo,
    updateVideo,
    updateVideoTitle,
    updateVideoDescription,
    changePublishOfVideo, 
    getAllVideo
} from "../controllers/video.controller.js"

import {verifyJWT,isAdmin,isUser} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = express.Router()

router.route("/upload-video").post(verifyJWT, isAdmin, upload.fields([
    {
        name: "video",
        maxCount : 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), uploadVideo)
router.route("/delete-video").delete(verifyJWT, isAdmin, deleteVideo)
router.route("/update-video").patch(verifyJWT, isAdmin, upload.single("video"),  updateVideo)
router.route("/update-video-title").patch(verifyJWT, isAdmin, updateVideoTitle)
router.route("/update-video-description").patch(verifyJWT, isAdmin, updateVideoDescription)
router.route("/change-video-publisher").patch(verifyJWT, isAdmin, changePublishOfVideo)
router.route("/get-all-video").get(getAllVideo)

export const videoRouter = router
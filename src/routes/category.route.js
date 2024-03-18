import express from "express";
import {createCategory, deleteCateogry, updateCategory} from "../controllers/category.controller.js"
import {verifyJWT, isAdmin, isUser} from "../middlewares/auth.middleware.js"

const router = express.Router()

router.route("/create-category").post(verifyJWT, isAdmin, createCategory)
router.route("/update-category").patch(verifyJWT, isAdmin, updateCategory)
router.route("/delete-category").delete(verifyJWT, isAdmin, deleteCateogry)

export const categorRrouter = router
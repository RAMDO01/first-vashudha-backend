import express from "express";

import {createNews, getAllNews, deleteNews} from "../controllers/news.controller.js"
import {verifyJWT, isAdmin, isUser} from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/create-news",verifyJWT, isAdmin, createNews)
router.get("/get-all-news", getAllNews)
router.delete("/delete-news",verifyJWT, isAdmin,  deleteNews)


export const newsrouter = router
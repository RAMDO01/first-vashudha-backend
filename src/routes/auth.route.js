import express from "express";
import {
    generateOtp, 
    register, 
    login, 
    logout, 
    getCurrentUser, 
    changeUserEmail, 
    changeUserName,
    changeCurrentPassword
} from "../controllers/auth.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = express.Router()

//import all auth controllers
router.post("/sendotp",generateOtp)
router.post("/user-register",register)
router.post("/user-login",login)
router.post("/user-logout",verifyJWT, logout)
router.post("/change-user-email",verifyJWT, changeUserEmail)
router.post("/change-user-name",verifyJWT, changeUserName)
router.get("/get-current-user",verifyJWT, getCurrentUser)
router.put("/change-password",verifyJWT, changeCurrentPassword)


export {router}
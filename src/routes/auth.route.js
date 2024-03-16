import express from "express";
import {generateOtp, register, login, logout} from "../controllers/auth.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = express.Router()

//import all auth controllers
router.post("/sendotp",generateOtp)
router.post("/user-register",register)
router.post("/user-login",login)
router.post("/user-logout",verifyJWT, logout)



export {router}
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {router} from "./routes/auth.route.js"

const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
)) 

app.use(express.json({
    limit: "20kb"
}))

app.use(express.urlencoded({extended: true, limit: "20kb"}))

app.use(express.static("public"))

app.use(cookieParser())

app.use("/api/v1/vashu",router)




export {app}
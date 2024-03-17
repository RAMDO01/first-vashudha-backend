import jwt from "jsonwebtoken"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

//auth middler ware
export const verifyJWT = asyncHandler( async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded?._id).select("-password -refreshToken")

        if(!user) {
            throw new ApiError(401, "INvalid access token -resetPasswordExpires")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }
})

//is admin middle ware
export const isAdmin = asyncHandler( async(req, _, next) => {
    if(req.user?.accountType !== "Admin") {
        throw new ApiError(404, "this route for only admin")
    }
    next()
})

//is user middle ware

export const isUser = asyncHandler( async(req, _, next) => {
    if(req.user?.accountType !== "User"){
        throw new ApiError(404, "this route for only user")
    }
    next()
})
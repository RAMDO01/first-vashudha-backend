import {User} from "../models/user.model.js"
import {OTP} from "../models/otp.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import otpGenerator from "otp-generator"
import jwt from "jsonwebtoken"


//generate access token and refresh toeken
const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        //why
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

//generate the otp
const generateOtp = asyncHandler( async(req, res) => {
    //fetch the data from frontend
    //validate the data
    //check user is allready exists
    //generate the opt
    //check otp is allready exists
    //create entry in db

    const {email} = req.body

    if(!email) {
        throw new ApiError(404, "email is required for verification")
    }

    const user = await User.findOne({email})
    console.log("this is user",user)
    if(user) {
        throw new ApiError(404,"User is already exists")
    }

    const otp = await otpGenerator.generate(6,{
        lowerCaseAlphabets:false,
        upperCaseAlphabets: false,
        specialChars: false
    })

    //check otp is already exists
    const result = await OTP.findOne({otp})
    while(result) {
        otp = await otpGenerator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets: false,
            specialChars: false
    })}

    const payload = {email,otp}

    const otpBody = await OTP.create(payload)
    console.log("This is otpBody",otpBody)

    //return response
    return res.status(201).json(
        new ApiResponse(200,otpBody,"otp generate successfull")
    )


})

//user register
const register = asyncHandler( async (req, res) => {
    //fetch the data from frontedn
    //validate the data 
    //validate user is already exists
    //match the password
    //check otp is correct or not
    //encrypt the password
    //create user ovhect -create entry in db
    //remove password and refresh token field form responce
    //check for user creation
    //return response

    const {fullName, email, password, confirmPassword, otp} = req.body
    let {accountType} = req.body

    if(
        [fullName, email, password, confirmPassword, otp].some( (field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const userExists = await User.findOne({email})
    if(userExists) {
        throw new ApiError(404, "User is allready exists")
    }

    if(password !== confirmPassword) {
        throw new ApiError(404, "Password is not match")
    }

    const findOtp = await OTP.findOne({otp})
    if(!findOtp) {
        throw new ApiError(404, "otp is not valid")
    }

    if(!accountType || accountType === undefined) {
        accountType = "User"
    }

    console.log("this is acct",accountType)

    const user = await User.create({
        fullName,
        email,
        password,
        accountType
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -resetPasswordExpires"
    )

    if(!createdUser) {
        throw new ApiError(500,"Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user is registered")
    )
    


})

//login
const login = asyncHandler ( async(req, res) => {
    //fetch the data
    //validate the data
    //check user is exists or not
    //generate the (access and refresh token)
    //send token in cookie
    //return response

    const {email, password} = req.body
    if(!email || !password) {
        throw new ApiError(404, "All fields are required")
    }

    const user = await User.findOne({email})
    if(!user) {
        throw new ApiError(404, "user not found, please register")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(404, "password is incorrect")
    }

    //generate the tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -resetPasswordExpires ")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )



})

//logout
const logout = asyncHandler( async(req, res) => {
    //fetch the user id
    //validate the user
    //clear the token form cookie and db
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    )
})


const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshAccessToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthoriaed request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(401, "invaid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expire or use")
        }

        const options = {
            httpOnly: true,
            secure:true
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res 
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
       throw new ApiError(500, error?.message || "invalid token ") 
    }
})

//change current password
const changeCurrentPassword = asyncHandler( async(req, res) => {
    const { oldPassword, newPassword, confirmNewPassword} = req.body
    if(
        [ oldPassword, newPassword, confirmNewPassword].some((field) => field.trim() === "")
        ){
        throw new ApiError(404, "all fields are required")
    }

    const user = await User.findById(req.user?._id)

    if(newPassword !== confirmNewPassword) {
        throw new ApiError(400, "Password is not matched")
    }

    //match the old password
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(isPasswordValid) {
        throw new ApiError(404,"Password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200) 
    .json(new ApiResponse(201, {}, "password change successfull"))


})

//get current user
const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200) 
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

//update account details
const changeUserName = asyncHandler( async(req, res) => {
    const {fullName} = req.body
    if(!fullName) {
        throw new ApiError(404, "fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName:fullName
            }
        },
        {new:true}
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Name is change successfull")
    )
})

//change user email
const changeUserEmail = asyncHandler( async(req, res) => {
    const {email, otp} = req.body
    if(!email) {
        throw new ApiError(404, "email is required for updating")
    }
    //check if emil is already exists
    // const existsUser = await User.findOne({email})
    // if(existsUser) {
    //     throw new ApiError(404, "Email is already exists")
    // }

    generateOtp()

    //check otp
    const result = await OTP.findOne({email}).split({createAt : -1}).limit(1)
    console.log("this is result", result)
    if(!result) {
        throw new ApiError(404, "otp is not valid")
    }else if(result[0].otp !== otp ) {
        throw new ApiError(404, "otp is wrong")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                email:email
            }
        },
        {new:true}
    )

    return res
    .status(200) 
    .json(
        new ApiResponse(201, user, "email is changed successfull")
    )

})

export {generateOtp, register,login, logout, refreshAccessToken, changeCurrentPassword, getCurrentUser, changeUserName, changeUserEmail}
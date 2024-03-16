import mongoose, { mongo } from "mongoose";
import { mailSender } from "../utils/mailSender.js";

const otpSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required:true
        },
        otp:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now(),
            expires: 60*5 //the document will be auto delete after 5 minutes
        }
    }
)

const sendOtpVerification = async(email, otp) => {
    try{
        const responce = await mailSender(
            email,
            "form VASHUDHA KALYRAN",
            otp
        )
        console.log("this is mail responce",responce)
        return responce
    } catch(error) {
        console.log("ERROR: error in send otp verification",error)
    }
}

otpSchema.pre("save", async function (next) {
    console.log("new document save in database")
    if(this.isNew) {
        await sendOtpVerification(this.email, this.otp)
    }
    next()
})

export const OTP = mongoose.model("OTP", otpSchema)
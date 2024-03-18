import mongoose from "mongoose";

const videoSchmea = new mongoose.Schema(
    {
        videoFile:{
            type: String, //cloudinary
            required:true
        },
        thumbnail:{
            type:String, //cloudinary
            required:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Category",
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        views:{
            type:Number,
            default:0
        }
    },
    {
        timestamps:true
    }
)


export const Video = mongoose.model("Video", videoSchmea)
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
            type:Schema.Types.ObjectId,
            ref:"User"
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
            type:Schema.Types.ObjectId,
            ref:"Category"
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
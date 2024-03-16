import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        }
    },
    {
        timestamps:true
    }
)

export const News = mongoose.model("News", newsSchema)
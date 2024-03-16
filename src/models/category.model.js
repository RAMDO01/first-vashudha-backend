import mongoose, { Schema } from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            type:String
        },
        video:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ]      
    }
)

export const Category = mongoose.model("Category", categorySchema)
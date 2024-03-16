import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
    {
        fullName:{
            type: String,
            required:true,
            index:true
        },
        email: {
            type: String,
            trim:true,
            unique:true,
            lowercase:true,
            required: true
        },
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        avatar:{
            type:String,
        },
        accountType: {
            type:String,
            enum:["User", "Admin"],
            required:true
        },
        videos:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
            
        ],
        posts:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Post" 
            }
        ],
        news:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"News" 
            }
        ],
        refreshToken:{
            type:String
        },
        resetPasswordExpires: {
            type: Date,
        }
    },
    {
        timestamps : true
    }
)

//hash the password before the use registration
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

//check password is correct or not while login the user
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
} 

//generate the accesstoken
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id:this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}



//generate the refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)
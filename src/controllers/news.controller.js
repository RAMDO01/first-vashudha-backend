import {News} from "../models/news.model.js"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"



//create news

const createNews = asyncHandler(async(req, res) => {
    const {title, description} = req.body
    if(!title || !description) {
        throw new ApiError(404, "fields are required")
    }

    // if(req.user.accountType !== "Admin"){
    //     throw new ApiError(404, "you are not able to create news")
    // }

    const news = await News.create({
        title,
        description
    })

    console.log("news is created")

    //update the user model
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $push:{
                news:news._id
            }
        },
        {new:true}
    )

    console.log("user is update")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "news is create sucessfully")
    )
})

//get news
const getAllNews = asyncHandler( async(req, res) => {
    const news = await News.find({},{title:true,description:true}).sort({createAt: -1})
    return res
    .status(200)
    .json(
        new ApiResponse(200,news,"all new are fetched")
    )
})



//delete news
const deleteNews = asyncHandler(async(req, res) => {
    const {newsId} = req.body
    if(!newsId){
        throw new ApiError(404,"news is missing")
    }
    await News.findByIdAndDelete(newsId)

    //update the user model
    const updateUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull:{
                news:newsId
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "new is delete sucess")
    )
})


export {createNews, getAllNews, deleteNews}


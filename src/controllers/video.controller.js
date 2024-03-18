import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import {Category} from "../models/category.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinay, destroyFileFromCloudinary} from "../utils/cloudinary.js"

//upload video
const uploadVideo = asyncHandler( async(req, res) => {
    //fetch the data from frontend
    //fetch the file form file
    //validate the data
    //check the user is admin
    //upload the thumbnail on cloudinary
    //upload the video on cloudinary
    //create the object and enter in db
    //return response
    let { title, description, category, isPublished } = req.body
    const videoLocalPath = req.files?.video[0]?.path;
    console.log("this is video local path",videoLocalPath)
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    console.log("this is thimbnail local path",thumbnailLocalPath)
    if(
        [title, description, category, videoLocalPath, thumbnailLocalPath].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(404,"all fields are required")
    }

    if(!isPublished || isPublished === undefined) {
        isPublished = true
    }

    const user = await User.findById(req.user._id,{ accountType:"Admin" })
    if(!user) {
        throw new ApiError(404, "video is upload only admin")
    }

    const categoryDetails = await Category.findById(category)
    if(!categoryDetails){
        throw new ApiError(404, "catgeory is defined")
    }

    const thumbnail = await uploadOnCloudinay(thumbnailLocalPath,"image")
    const video = await uploadOnCloudinay(videoLocalPath,"video")
    console.log("this is video",video)

    if(!thumbnail.url) {
        throw new ApiError(404, "errror in uploading thumbniail")
    }
    if(!video.url) {
        throw new ApiError(404, "errror in uploading video")
    }

    const createdVideo = await Video.create({
        videoFile: video.url,
        thumbnail:thumbnail.url,
        owner:user._id,
        title,
        description,
        category:categoryDetails._id,
        isPublished:isPublished,
        duration:video.duration,
    })

    if(!createdVideo){
        throw new ApiError(404,"video is no create")
    }

    //update the user model
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $push:{
                videos:createdVideo._id
            }
        },
        {new:true}
    )

    //update the category
    await Category.findByIdAndUpdate(
        categoryDetails._id,
        {
            $push:{
                video:createdVideo._id
            } 
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedUser,"video is created")
    )
})


//delete the video
const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.body
    if(!videoId){
        throw new ApiError(404,"video local path is required")
    }

    await Video.findByIdAndDelete(videoId)

    //clear the video id form user model
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull:{
                videos:videoId
            }
        },
        {new:true}
        )

    return res
    .status(200)
    .json(
        new ApiResponse(200,{}, "video is delete")
    )
})

//update the video
const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.body
    const videoLocalPath = req.file?.path
    if(!videoLocalPath) {
        throw new ApiError(404, "video local path is missing")
    }

    if(!videoId) {
        throw new ApiError(404, "video id is missing")
    }

    //first we delete the old video
    const oldVideo = await Video.findById(videoId)
    const odlVideoUrl = oldVideo.videoFile

    await destroyFileFromCloudinary(odlVideoUrl, "video")

    //then upload the video on cloudinary
    const newVideo = await uploadOnCloudinay(videoLocalPath,"video")
    if(!newVideo.url){
        throw new ApiError(404, "error in uploading video on cloudinary")
    }
    //update the video model
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                videoFile:newVideo.url,
                duration:newVideo.duration
            }
        },
        {new:true}
    )

    //return response
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedVideo,"video is updated")
    )

})

//update the title 
const updateVideoTitle = asyncHandler(async(req, res) => {
    const {title, videoId} = req.body
    if(!title || !videoId) {
        throw new ApiError(404, "title and video id is missing")
    }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title:title
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updateVideo,"title is update successfully")
    )
})

//update the description
const updateVideoDescription = asyncHandler(async(req, res) => {
    const {description, videoId} = req.body

    if(!description || !videoId){
        throw new ApiError(404, "video description and video id is missing")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                description:description
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedVideo,"video description is updated")
    )

})


//change the publish
const changePublishOfVideo = asyncHandler(async(req, res) => {
    const {isPublished, videoId} = req.body
    if(!isPublished|| !videoId) {
        throw new ApiError(404, "is published query is required")
    }
    console.log("this is video  ispublished", isPublished)

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished:isPublished
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, updateVideo, "video published is changed")
    )
})


//get the newest video from the data base
const getAllVideo = asyncHandler(async(req, res) => {
    const allVideo = await Video.find(
        {},
        {
            title:true,
            description:true
        }
    ).sort({createAt:-1}).populate("videoFile thumbnail title description category duration isPublished views")

    return res
    .status(200)
    .json(
        new ApiResponse(200,allVideo, "all video is fetched")
    )
})



export {
    uploadVideo, 
    deleteVideo,
    updateVideo,
    updateVideoTitle,
    updateVideoDescription,
    changePublishOfVideo, 
    getAllVideo
}
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinay = async (localPath) => {
    try {
        if(!localPath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localPath,{
            resource_type:"auto"
        })

        //file has veen upload successfull
        fs.unlink(localPath)
        return response
    } catch (error) {
        fs.unlink(localPath)
        console.log("error in cloudinary controller",error)
        return null
    }
}

export {uploadOnCloudinay}
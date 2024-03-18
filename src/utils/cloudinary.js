import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { extractPublicId } from 'cloudinary-build-url'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinay = async (localPath, resourceType) => {
    try {
        if(!localPath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localPath,{
            resource_type:`${resourceType}`
        })

        //file has veen upload successfull
        fs.unlinkSync(localPath)
        return response
    } catch (error) {
        fs.unlinkSync(localPath)
        console.log("error in cloudinary controller",error)
        return null
    }
}


const destroyFileFromCloudinary = async(imageUrl, resourceType) => {
    try {
         
        if(!imageUrl) return null

        const publicId = extractPublicId( imageUrl )

        //const publicId = cloudinary.url(imageUrl)
        console.log("this is old avatar public id",publicId)

        await cloudinary.uploader.destroy(publicId,{
            resource_type:`${resourceType}`
        })
        console.log("old image is deleted")
        return
    } catch (error) {
        console.log("error in deleting avatar form cloudinary",error)
    }
}

export {uploadOnCloudinay, destroyFileFromCloudinary}
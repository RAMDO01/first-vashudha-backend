import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//create category
const createCategory = asyncHandler( async(req, res) => {
    const {name, description} = req.body
    if(!name || !description) {
        throw new ApiError(404, "All fields are required")
    }

    if(req.user.accountType !== "Admin"){
        throw new ApiError(404, "you are not abel to create the category")
    }

    const category = await Category.create({
        name,
        description
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, category, "category is created")
    )
})


//delete category
const deleteCateogry = asyncHandler(async(req, res) => {
    const {categoryId} = req.body
    if(!categoryId) {
        throw new ApiError(404,"category id is required for delete cateogry")
    }

    // if(req.user.accountType !== "Admin"){
    //     throw new ApiError(404, "you are not able to delte the category")
    // }

    await Category.findByIdAndDelete(categoryId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"category is deleted")
    )
})


//update category
const updateCategory = asyncHandler(async(req, res) => {
    const {name, description, categoryId} = req.body
    if(!name || !description, !categoryId) {
        throw new ApiError(404, "fields are required")
    }

    const category = await Category.findById(categoryId)
    if(!category) {
        throw new ApiError(404, "this category is not able")
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        {
            $set:{
                name:name,
                description:description
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedCategory,"category is update")
        
        )
})


export {createCategory, deleteCateogry, updateCategory}
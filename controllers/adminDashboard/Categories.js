const { response } = require("express");
const formidable = require("formidable");
const { responseReturn } = require("../../utils/responseReturn");
const cloudinary = require("cloudinary").v2
const CategoryModel = require("../../models/CategoryModel")
class categories {


    addCategory = async(req,res)=>{
        const form = formidable()

        form.parse(req,async(err,fields,files)=>{
            const {name} = fields;
            const {image} = files;
            console.log(fields)
            console.log(files)

            if(err){
                responseReturn(res,404,"not message")
            }else{
                try {
                    let  slug = name.trim()
                    let newSlug = slug.split(" ").join("-")

                    cloudinary.config({ 
                        cloud_name: process.env.cloud_name,
                        api_key:  process.env.api_key, 
                        api_secret: process.env.api_secret
                    });

                    const result = await cloudinary.uploader.upload(image.filepath)
                    if(!result) {
                        return res.status(401).end("image upload fail")
                    }
                    if(result){
                        const cat = await CategoryModel.create({
                            name : name,
                            slug : newSlug,
                            image : result.url
                        })
                        responseReturn(res,201,{cat,message : "category added successfully"})
                    }else{
                        responseReturn(res,401,{error : "somthing wrong try again !"})
                    }
                } catch (error) {
                    responseReturn(res,500,{error : error.message})

                }
            }
        })
    }

    // end method 

    get_categories = async(req,res)=>{

        try {
            const categories = await CategoryModel.find({}).sort("-id")
            if(categories){
                responseReturn(res,200,{categories,message : "category success"})
            }else{
                responseReturn(res,404,{error : "fitch category field !"})
            }
        } catch (error) {
            responseReturn(res,500,{error : error.message})
        }


    }
    // end method 


    deleteCategory = async(req,res)=>{
        const {id} = req.body

        try{
            const category = await CategoryModel.findByIdAndDelete(id)
            const allCategories = await CategoryModel.find({});
            if(category){
                responseReturn(res,201,{allCategories,message : "category deleted "})
            }else{
                responseReturn(res,404,{error : "cannot delete category try again !"})
            }
        }catch(err){
            responseReturn(res,500,{error : err.message})
        }
    }
}


module.exports = new categories

const sellerModel = require("../../models/sellerModel");
const { createToken } = require("../../utils/createtoken");
const { responseReturn } = require("../../utils/responseReturn");
const bcrypt = require("bcrypt")

class sellerAuthController {

    sellerRegister = async(req,res)=>{
        const {name,email,password,shopName,country,city,phone} = req.body 
        try {
            const checkSeller = await sellerModel.findOne({email});
            console.log(checkSeller)
            if(checkSeller === null){
                const seller = await sellerModel.create({
                    name : name,
                    email : email,
                    password : await  bcrypt.hash(password,9),
                    shopName : shopName,
                    country : country,
                    city : city,
                    phone : phone,
                 })
                 const data = await sellerModel.find({email})
                 responseReturn(res,200,{data,message : "seller register success"})
            }else{
                responseReturn(res,401,{error : "email already exist ! "})
            }

        } catch (error) {
            responseReturn(res,500,{error : error.message})
        }

    }

    // end method 


    sellerLogin = async(req,res)=>{
        console.log(req.body)
        const {email,password} = req.body
        try {
            const checkSeller = await sellerModel.findOne({email}).select("+password");
            if(checkSeller){
                const checkPassword = await bcrypt.compare(password,checkSeller.password);
                if(checkPassword){
                    const token = await createToken({
                        id : checkSeller.id,
                        role : "seller"
                    })
                    res.cookie("accessToken",token,{
                        expires : new Date(Date.now() + 7 * 24 * 60 *60 * 1000),
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                    })
                    responseReturn(res,200,{token,message : "Login success"})
                }else{
                    responseReturn(res,404 , {error : "password wrong !"})
                }
            }else{
                responseReturn(res,404,{error : "email not found !"})
            }
            
        } catch (error) {
            responseReturn(res,500,{error : error.message})
        }
    }

    // end method

    getSellerData = async(req,res)=>{
        const {id,role} = req;

        try {
            const seller = await sellerModel.findById(id);
            if(seller){
                responseReturn(res,200,{seller,message : "success"})
            }else{
                responseReturn(res,404,{error : "please login"})
            }
        } catch (error) {
            responseReturn(res,500,{error : error.message})
        }
    }
}


module.exports = new sellerAuthController

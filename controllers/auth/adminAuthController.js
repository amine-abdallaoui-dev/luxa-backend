const adminModel = require("../../models/adminModel");
const { createToken } = require("../../utils/createtoken");
const { responseReturn } = require("../../utils/responseReturn");
const bcrypt = require("bcrypt");

class adminAuthController {

    admin_Login = async (req, res) => {
        
        const { email, password } = req.body;

        try {
            const admin = await adminModel.findOne({email : email}).select("+password");
            if(admin){
                const checkPassword = await bcrypt.compare(password,admin.password);
                if (checkPassword) {
                    const token = await createToken({
                        id: admin._id,
                        role: admin.role
                    });
                
                    // 1. Define safe cookie configuration settings
                    const cookieOptions = {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        httpOnly: true, // Protects against XSS attacks
                        path: '/',       // Ensures the cookie is sent for ALL API endpoints
                        secure: true, 
                        sameSite:'none'
                    };

    res.cookie("access_token", token, cookieOptions);
    
    return responseReturn(res, 200, { token, message: "Login success !" });

                }else{
                   responseReturn(res,404,{error : "Password wrong !"}) 
                }
            }else{
                responseReturn(res,404,{error : "Email not found !"})
            }
        } catch (error) {
            responseReturn(res,500,{error : error.message})
        }
    }

    // end method

    get_admin = async (req,res) => {
        const {id , role } = req;
        try{
            if(role === "admin"){
                const admin = await adminModel.findById(id);
                responseReturn(res,200,{admin,message : "success !"})
            }else{
                console.log("Unauthorized !")
            }
        }catch(error){
                responseReturn(res,500,{error : error.message})
        }
    }

    admin_logout = async (req, res) => {
        try {
            res.cookie("access_token", null, {
                expires: new Date(Date.now()),
                httpOnly: true
            });
            responseReturn(res, 200, { message: "Logout success !" });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }
}


module.exports = new adminAuthController();

const jwt  = require('jsonwebtoken')

module.exports.createToken = (data)=>{
    const token =  jwt.sign(data,process.env.JWt_SECRET_KEY,{expiresIn : "7d"})
    return token;
}
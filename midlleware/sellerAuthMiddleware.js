const jwt = require('jsonwebtoken');



module.exports.sellerAuthMiddleware = (req,res,next) => {

    const {accessToken} = req.cookies;
    if(!accessToken){
        return res.status(401).json({error : "Unauthorized Please login first !"})
    }else{
        try {
            const decoded = jwt.verify(accessToken,process.env.JWt_SECRET_KEY);
            if(decoded){
                req.id = decoded.id;
                req.role = decoded.role;
                next();
            }else{
                return res.status(401).json({error : "Unauthorized Please login first !"})
            }
        } catch (error) {
            return res.status(401).json({error : "Unauthorized Please login first !"})
        }
    }






}
const {Schema,model} =require("mongoose")


const sellerSchema = new Schema({
    name : {
        type : String,
        require : true,
    },
    email : {
        type : String,
        require : true,
    },
    password : {
        type : String,
        require : true,
    },
    shopName : {
        type : String,
        require : true,
    },
    country : {
        type : String,
        require : true,
    },
    city : {
        type : String,
        require : true,
    },
    phone : {
        type : String,
        require : true,
    },
    status : {
        type : String,
        default : "inActive"
    },
    shopStatus : {
        type : String,
        default : "close"
    },
    role : {
        type : String,
        default : "seller"
    }
})



module.exports = model("sellers",sellerSchema)
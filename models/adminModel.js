const mongose = require("mongoose");

const {Schema,model} = mongose;

const adminSchema = new Schema({

    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    image : {
        type : String,
        default : "image.png"
    },
    role : {
        type : String,
        default : "admin"
    }

})


module.exports = model("admins",adminSchema);
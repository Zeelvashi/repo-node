const mongoose = require('mongoose');

const Schema = mongoose.Schema

const UserSchema = new Schema ({
    firstname:{
        type:String
    },
    lastname:{
        type:String
    },
    contactno:{
        type:Number
    },
    email:{
        type:String
    },
    problem:{
        type:String
    },
    comment:{
        type:String
    },
    rate:{
        type:Number
    },
},{
    timestamps:true
})

const User = mongoose.model("User",UserSchema);

module.exports = User;
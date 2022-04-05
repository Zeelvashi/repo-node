const mongoose = require('mongoose');

const ForgotpasslSchema=new mongoose.Schema({
   email:{
       type:String
   },
   otp:{
       type:Number
   },
   username:{
       type:String
   }
},{
    timestamps:true
})
const Forgotpass = new mongoose.model("Forgotpass",ForgotpasslSchema);

module.exports = Forgotpass;
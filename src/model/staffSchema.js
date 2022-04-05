const mongoose = require('mongoose');

const Schema = mongoose.Schema

const staffSchema = new Schema({
    staffname:{
        type:String,
  
    },
    staffemail:{
        type:String,
      
    },
    branchname:{
        type:String,
       
    },
    staffaddress:{
        type:String,
       
    },
    city:{
        type:String,
       
    },
    contactnumber:{
        type:Number,
        
    },
    username:{
        type:String,
        unique:true
    },
    password:{
        type:String
    },
 },{
        timestamps:true
    })

const Staff = new mongoose.model("Staff",staffSchema);

module.exports = Staff;
const mongoose = require('mongoose');

const StaffParcelSchema=new mongoose.Schema({
    referancenumber:{
        type:Number
    },
    sendername:{
        type:String
    },
    receivername:{
        type:String
    },
    senderaddress:{
        type:String
    },
    receiveraddress:{
        type:String
    },
    sendercontactnumber:{
        type:Number
    },
    receivercontactnumber:{
        type:Number
    },
    senderemail:{
        type:String
    },
    receiveremail:{
        type:String
    },
    sendercity:{
        type:String
    },
    receivercity:{
        type:String
    },
    branchprocessed:{
        type:String
    },
    pickupbranch:{
        type:String
    },
    weight:{
        type:Number
    },
    height:{
        type:Number
    },
    width:{
        type:Number
    },
    route:{
        type:String
    },
    price:{
        type:Number
    },
    parcelstatus:{
        type:String,
        default:"Collected"
    },
    branchparcelstatus:{
        type:String,
        default:"Collected"
    },
    assignto:{
        type:String
    },
    receivedate:{
        type:String
    },
    deliverydate:{
        type:String
    },
    flag:{
        type:Number
    }
},{
    timestamps:true
})

const StaffParcel = new mongoose.model("StaffParcel",StaffParcelSchema);

module.exports = StaffParcel;
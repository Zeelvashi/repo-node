const mongoose=require('mongoose');
const bcrypt = require('bcryptjs');
const adchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
       
    },
    password:{
        type:String,
        required:true
    },
},
    {
        timestamps: true,
    }
)
adchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // console.log(`current password ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`current password ${this.password}`);
       
    }
    next();
})
const Admin=new mongoose.model("Admin",adchema);

module.exports=Admin;
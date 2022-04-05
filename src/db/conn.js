const mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/adlogin").then(()=>{console.log("Connection is established")});
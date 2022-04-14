const mongoose=require('mongoose');

// mongoose.connect("mongodb://localhost:27017/adlogin").then(()=>{console.log("Connection is established")});

mongoose.connect("mongodb+srv://knzcourier:knz2002@cluster0.apufr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
.then(()=>{
    console.log('mongo connected');
})
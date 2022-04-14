const express=require('express');
const bodyParser = require('body-parser')
var cors = require('cors')
const dotenv = require('dotenv')
require("./db/conn");
const Admin=require("./model/adminschema");
const router=require("./Router/Admin");
const Branch = require('./model/AddBranch');
const Branchrouter = require('./Router/BranchRouter');
const Staffrouter = require("./Router/StaffRouter");
const UserRouter = require("./Router/User");


dotenv.config()
const app=express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(router)


app.use(Branchrouter)

app.use(Staffrouter)

app.use(UserRouter)

app.get("/",(req,res)=>{
    res.send("helloo")
})


app.listen(process.env.PORT || 8000,()=>{
    console.log("listning 8000");
})
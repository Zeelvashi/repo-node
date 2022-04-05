const Branch = require('../model/AddBranch');
const express = require('express')
const Branchrouter = express.Router();
const { generateToken } = require('../service/token')
const { validate } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Parcel = require('../model/parcelSchema');
const Staff = require('../model/staffSchema');
const StaffParcel = require('../model/StaffParcelSchema');
const DestinationParcel = require('../model/DestinationSchema');
const moment = require('moment');


Branchrouter.put("/branchloginupdate/:id", async (req, res) => {
    const id = req.params.id;
    var update = req.body;
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const updateData = await Branch.findByIdAndUpdate(id, update, {
        new: true
    })
    if (updateData) {
        res.send(updateData);
    }
})

Branchrouter.post('/branchlogin', async (req, res) => {
   try {
    const { username, password } = req.body

    const userValid = await Branch.findOne({ username: username })
    const ismatch = await bcrypt.compare(password, userValid.password);

    if (!userValid) {
        return res.status(400).send({
            status: true,
            message: 'User Not Exist.'
        })
    }
    if (userValid) {
        if (!ismatch) {
            return res.status(400).send({
                status: true,
                message: 'Invalid Password.'
            })
        }
        else {
            const payload = { username: username, type: "branch" }
            const token = generateToken(payload)
            return res.status(200).send({
                status: true,
                message: 'Log in Successfully.',
                token
            })
        }
    }
   } catch (error) {
       return res.status(400).send(error);
   }

});
Branchrouter.get('/bloggedin', validate, async (req, res) => {
    const { username } = req.decoded

    const userValid = await Branch.findOne({ username })

    return res.status(200).send({
        status: true,
        message: 'Logged in Successfully.',
        userValid
    })
})

Branchrouter.get('/branchparceldata/:branchname', async (req,res)=>{
    const branchname = req.params.branchname;
    
    const pendingdata = await DestinationParcel.find({pickupbranch:branchname,parcelstatus:"Pending"})
    const bdata = await DestinationParcel.find({pickupbranch:branchname,$or:[{parcelstatus:"Received"},{branchparcelstatus:"Delivered"}]})
    const branchinfo=await Parcel.find({branchprocessed:branchname})
    const stfdata = await Staff.find({branchname})
    const cparcel = await Parcel.find({branchprocessed:branchname}).count();
    const rparcel= await DestinationParcel.find({pickupbranch:branchname,parcelstatus:"Received"}).count();
    const tparcel =cparcel+rparcel;
    const collectedparcel=await Parcel.find({branchprocessed:branchname,branchparcelstatus:"Collected"}).count();
    const receiveparcel=await DestinationParcel.find({pickupbranch:branchname,branchparcelstatus:"Received"}).count();
    const destination = await Parcel.find({branchprocessed:branchname,mainparcelstatus:"Delivered"}).count();
    console.log('parcrl',tparcel);
    const tstaff = await Staff.find({branchname:branchname}).count()
    const tdispatch = await Parcel.find({branchprocessed:branchname,mainparcelstatus:"Dispatch"}).count();
    const tdeliver = await StaffParcel.find({pickupbranch:branchname,branchparcelstatus:"Delivered"}).count();
    const toutfordelivery = await DestinationParcel.find({pickupbranch:branchname,branchparcelstatus:"Ready To Delivery"}).count();
    return res.status(200).send({
        status: true,
        message: ' Successfully.',
        bdata,
        pendingdata,
        branchinfo,
        stfdata,
        tparcel,
        tstaff,
        tdispatch,
        tdeliver,
        collectedparcel,
        receiveparcel,
        destination,
        toutfordelivery
    })
})
Branchrouter.put("/updatebranchparcelstatus/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.body);

        const updateData = await DestinationParcel.findByIdAndUpdate(id, req.body, {
            new: true
        })
        if (updateData.branchparcelstatus == "Ready To Delivery") {
            const supdateData = await StaffParcel.updateOne({ referancenumber: updateData.referancenumber }, { parcelstatus: "Received", branchparcelstatus: "Received", receivedate: moment(updateData.updatedAt).format('L') }, {
                new: true
            })
        }
        if (updateData.branchparcelstatus == "Received") {
            const supdateData = await StaffParcel.updateOne({ referancenumber: updateData.referancenumber }, { parcelstatus: "Collected", receivedate: moment(updateData.updatedAt).format('L') }, {
                new: true
            })
        }
        if (updateData) {
            res.status(200).send({ message: "update successful" })
        }
        else {
            res.status(200).send({ message: "failed to update" })
        }
    } catch (error) {
        console.log(error);
    }
})
Branchrouter.put("/updateassignstatus/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = await DestinationParcel.findByIdAndUpdate(id, req.body, {
            new: true
        })
        if (updateData.assignto) {
            const updateDatas = await StaffParcel.updateOne({ referancenumber: updateData.referancenumber }, { assignto: updateData.assignto,flag: 1 }, {
                new: true
            })
        }
        if (updateData) {
            res.status(200).send({ message: "update successful" })
        }
        else {
            res.status(200).send({ message: "failed to update" })
        }
    } catch (error) {
        console.log(error);
    }
})

Branchrouter.put("/updatependingparcelstatus/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.body);
        const { parcelstatus, branchparcelstatus } = req.body;

        const updateData = await DestinationParcel.findByIdAndUpdate(id, { parcelstatus: parcelstatus, branchparcelstatus: branchparcelstatus }, {
            new: true
        })
        if (updateData.parcelstatus == "Received") {
            const receivedate = await DestinationParcel.updateOne({ referancenumber: updateData.referancenumber }, { receivedate: moment(updateData.updatedAt).format('L') }, {
                new: true
            })
            const supdateData = await Parcel.updateOne({ referancenumber: updateData.referancenumber }, {mainparcelstatus: "Delivered",receivedate: moment(updateData.updatedAt).format('L') , flag:1 }, {
                new: true
            })
        }
              
        
        // if(updateData.branchparcelstatus == "Received"){
        //     const supdateData = await StaffParcel.updateOne({referancenumber:updateData.referancenumber},{parcelstatus:"Collected",receivedate:moment(updateData.updatedAt).format('L')}, {
        //         new: true
        //     })
        // }
        if (updateData) {
            res.status(200).send({ message: "update successful" })
        }
        else {
            res.status(400).send({ message: "failed to update" })
        }
    } catch (error) {
        console.log(error);
    }
})

// Branchrouter.get("/notificationdata/:branchname", async (req, res) => {
//     const branchname = req.params.branchname
//     const parceldata = await Parcel.find({ flag: "1", branchprocessed: branchname })
//     const parceldatacount = await Parcel.find({ flag: "1", branchprocessed: branchname }).count();
//     return res.status(200).send({
//         status: true,
//         parceldata,
//         parceldatacount
//     })
// })


Branchrouter.put("/updatepassword", async (req, res) => {
    try {
        const { username, password } = req.body
        // console.log('pwd',password);
        const branchuser = await Branch.findOne({ username : username });
        // console.log("uservalid pass", branchuser);

        if (!branchuser) {
            return res.status(400).send({
                status: false,
                message: 'user not exist'
            })
        }
        else {
            const salt = await bcrypt.genSalt(10)
            const bpwd = await bcrypt.hash(password, salt)

            const branchdata = await Branch.findOneAndUpdate({ username: branchuser.username }, { password: bpwd }, {
                new: true
            })
            console.log('data', branchdata);

            if (branchdata) {
                res.status(200).send({ message: "update successfully,," })
            }
            else {
                res.status(424).send({ message: "failed to update" })
            }
        }
    } catch (error) {
        console.log(error);
    }
})

Branchrouter.get('/branchparcelreport/:branchname', async (req,res)=>{
    const branchname = req.params.branchname;
    const readytodelivery = await StaffParcel.find({pickupbranch:branchname,parcelstatus:"Received"})
    // const rdata = await DestinationParcel.find({pickupbranch:branchname},{parcelstatus:"Received"})
    const rdata = await DestinationParcel.find({pickupbranch:branchname,parcelstatus:"Received"})
    const Collected=await Parcel.find({branchprocessed:branchname})
    return res.status(200).send({
        status: true,
        message: ' Successfully.',
        readytodelivery,
        rdata,
        Collected
    })
})

Branchrouter.get('/branchparcelreport/:branchname/:pstatus/:bdate', async (req,res)=>{
    const branchname = req.params.branchname;
    const pstatus = req.params.pstatus;
    const bdate=moment(req.params.bdate).format('L')
    var parceldata=" ";
    var nodata=" ";
    if(pstatus == "Collected"){
         parceldata=await Parcel.find({branchprocessed:branchname})
    }
    else if(pstatus == "Delivered"){
         parceldata=await DestinationParcel.find({branchprocessed:branchname,parcelstatus:"Received",receivedate:bdate})
    }
    else if(pstatus == "Received"){
         parceldata=await DestinationParcel.find({pickupbranch:branchname,parcelstatus:"Received",receivedate:bdate});
    }
    else if(pstatus == "Delivered By Staff"){
         parceldata = await StaffParcel.find({pickupbranch:branchname,branchparcelstatus:"Delivered",deliverydate:bdate})
    }
    else{
        nodata="No Data";
    }
    return res.status(200).send({
        status: true,
        message: ' Successfully.',
        parceldata,
        nodata
    })
})

Branchrouter.get("/notificationdata/:branchname",async(req,res)=>{
    const branchname=req.params.branchname
    const parceldata=await Parcel.find({flag:1,branchprocessed:branchname})
    const parceldatacount=await Parcel.find({flag:1,branchprocessed:branchname}).count();
    const staffparceldata= await DestinationParcel.find({flag:1,pickupbranch:branchname,branchparcelstatus:"Delivered"})
    const staffparceldatacount=await DestinationParcel.find({flag:1,pickupbranch:branchname,branchparcelstatus:"Delivered"}).count();
    const total=parceldatacount+staffparceldatacount;
    return res.status(200).send({
        status:true,
        parceldata,
        staffparceldata,
        total
    })
})
Branchrouter.put("/updateflag/:branchnm",async(req,res)=>{
    const branchname=req.params.branchnm
    const updatedata=await Parcel.updateMany({branchprocessed:branchname,flag:1},{flag:0},
     {
        new: true
    })
    const updatestaff=await DestinationParcel.updateMany({pickupbranch:branchname},{flag:0},
        {
            new :true
        })
     if(updatedata){
            res.status(200).send({
                updatedata
            })
        }
        else if(updatestaff){
            res.status(200).send({
                updatestaff
            })
        }
        else{
            console.log("no data");
        }

})


Branchrouter.put("/updatependingparcelstatus/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.body);
        const {parcelstatus,branchparcelstatus} = req.body;
        const updateData = await DestinationParcel.findByIdAndUpdate(id,{parcelstatus:parcelstatus,branchparcelstatus:branchparcelstatus}, {
            new: true
        })
        if(updateData.parcelstatus == "Received"){
            const receivedate = await DestinationParcel.updateOne({referancenumber:updateData.referancenumber},{receivedate:moment(updateData.updatedAt).format('L')}, {
                new: true
            })
        }
        if(updateData.parcelstatus == "Received"){
            const supdateData = await Parcel.updateOne({referancenumber:updateData.referancenumber},{mainparcelstatus:"Delivered",receivedate:moment(updateData.updatedAt).format('L'),flag:"1"}, {
                new: true
            })
        }
        // if(updateData.branchparcelstatus == "Received"){
        //     const supdateData = await StaffParcel.updateOne({referancenumber:updateData.referancenumber},{parcelstatus:"Collected",receivedate:moment(updateData.updatedAt).format('L')}, {
        //         new: true
        //     })
        // }
        if (updateData) {
            res.status(200).send({ message: "update successful" })
        }
        else {
            res.status(200).send({ message: "failed to update" })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = Branchrouter;
const express = require('express')
const router = express.Router();
const Admin = require("../model/adminschema");
const { generateToken } = require('../service/token')
const { validate } = require('../middleware/auth');
const Branch = require('../model/AddBranch');
const Staff = require('../model/staffSchema');
const Parcel = require('../model/parcelSchema');
const bcrypt = require('bcryptjs');
const StaffParcel = require('../model/StaffParcelSchema');
const DestinationParcel = require('../model/DestinationSchema');
const nodemailer = require('nodemailer');
const moment = require('moment');


router.post('/login', async (req, res) => {
    const { username, password } = req.body

    const userValid = await Admin.findOne({ username: username })
    
    if (!userValid) {
        return res.status(400).send({
            status: true,
            message: 'User Not Exist.'
        })
    }
    if (userValid) {
        const ismatch = await bcrypt.compare(password,userValid.password);
        if (!ismatch) {
            return res.status(400).send({
                status: true,
                message: 'Invalid Password.'
            })
        }
        else {
            const payload = { username: username ,type:"admin"}
            const token = generateToken(payload)
            return res.status(200).send({
                status: true,
                message: 'Log in Successfully.',
                token
            })
        }
    }

});

router.get('/loggedin', validate, async (req, res) => {
    const { username } = req.decoded

    const userValid = await Admin.findOne({ username })

    return res.status(200).send({
        status: true,
        message: 'Logged in Successfully.',
        userValid
    })
})
router.get('/aloggin', validate, async (req, res)=>{
    const data=req.decoded;
    
    return res.status(200).send({
        status: true,
        message: 'token',
        data
    })
    
  });

router.post("/addbranch", async (req, res) => {
    const { branchname, branchaddress, branchcontactnumber, branchemail, city, zipcode } = req.body;
    try {
        const branch = new Branch({
            branchname,
            branchaddress,
            branchcontactnumber,
            branchemail,
            city,
            zipcode,
            username:branchname,
            password:123
        })
        const register = await branch.save();
        console.log(register);
        if (register) {
            res.status(200).json({ message: "Data added successfully" });

        }
        else {
            res.status(400).json({ message: "fail to register" })
        }
        res.status(400).json({ message: "fail to register" })
    }
    catch (error) {
        console.log(error);
    }
})

router.get("/branchinfo", async (req, res) => {
    const branchData = await Branch.find();
    return res.status(200).send({
        status: true,
        message: 'Fetch Successfully.',
        branchData
    })
})
router.delete("/deleteBranchData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const delData = await Branch.findByIdAndDelete(id);
        if (delData) {
            res.status(200).json({ message: "delete successful" })
        }
        else {
            res.status(400).json({ message: 'fail to delete' })
        }
    } catch (error) {

    }
})

router.put("/updateBranchData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = await Branch.findByIdAndUpdate(id, req.body, {
            new: true
        })
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
router.get("/editdata/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const editData = await Branch.findById(id);
        //res.send(editData)
        return res.status(200).send({
            status: true,
            message: 'Fetch Successfully.',
            editData
        })
    } catch (error) {
        console.log(error);

    }
})

router.post("/addstaff", async (req, res) => {
    const { staffname, staffemail, branchname, staffaddress, city, contactnumber } = req.body;
    try {
        const staff = new Staff({
            staffname,
            staffemail,
            branchname,
            staffaddress,
            city,
            contactnumber,
            username:staffname,
            password:123
        })
        const register = await staff.save();
        if (register) {
            res.status(200).json({ message: "Data added successfully" });

        }
        else {
            res.status(400).json({ message: "fail to register" })
        }
    }
    catch (error) {
        console.log(error);
    }
})
router.get("/staffinfo", async (req, res) => {
    const staffData = await Staff.find();
    return res.status(200).send({
        status: true,
        message: 'Fetch Successfully.',
        staffData
    })
})

router.delete("/deleteStaffData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const delData = await Staff.findByIdAndDelete(id);
        if (delData) {
            res.status(200).json({ message: "delete successful" })
        }
        else {
            res.status(400).json({ message: 'fail to delete' })
        }
    } catch (error) {

    }
})

router.get("/staffdata/:branchname", async (req, res) => {
    try {
        const branchname = req.params.branchname;
        const staffData = await Staff.find({branchname:branchname});
        //res.send(editData)
        return res.status(200).send({
            status: true,
            message: 'Fetch Successfully.',
            staffData
        })
    } catch (error) {
        console.log(error);

    }
})
router.get("/editstaffdata/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const staffData = await Staff.findById(id);
        //res.send(editData)
        return res.status(200).send({
            status: true,
            message: 'Fetch Successfully.',
            staffData
        })
    } catch (error) {
        console.log(error);

    }
})


router.put("/updateStaffData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = await Staff.findByIdAndUpdate(id, req.body, {
            new: true
        })
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

router.post("/addparcel", async (req, res) => {
    const { referancenumber, sendername, receivername, senderaddress, receiveraddress, sendercontactnumber,
        receivercontactnumber,
        senderemail,
        receiveremail,
        sendercity,
        receivercity,
        branchprocessed,
        pickupbranch,
        weight,
        height,
        width,
        route,
        price } = req.body;
    try {
        const parcel = new Parcel({
            referancenumber, sendername, receivername, senderaddress, receiveraddress, sendercontactnumber,
            receivercontactnumber,
            senderemail,
            receiveremail,
            sendercity,
            receivercity,
            branchprocessed,
            pickupbranch,
            weight,
            height,
            width,
            route,
            price,
            // orderdate:moment(createdAt).format('L'),
        })
        const register = await parcel.save();
        // moment().format('L');
       
        const staffParcel = new StaffParcel({
            referancenumber, sendername, receivername, senderaddress, receiveraddress, sendercontactnumber,
            receivercontactnumber,
            senderemail,
            receiveremail,
            sendercity,
            receivercity,
            branchprocessed,
            pickupbranch,
            weight,
            height,
            width,
            route,
            price
        })
        const registerstaffparcel = await staffParcel.save();

        const destinationParcel = new DestinationParcel({
            referancenumber, sendername, receivername, senderaddress, receiveraddress, sendercontactnumber,
            receivercontactnumber,
            senderemail,
            receiveremail,
            sendercity,
            receivercity,
            branchprocessed,
            pickupbranch,
            weight,
            height,
            width,
            route,
            price
        })
        const registerdparcel = await destinationParcel.save();
        if (register) {
            res.status(200).json({ message: "Data added successfully" });
            let mailTransporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 465,
                secure: false,
                service: 'gmail',
                auth: {
                    user: 'knzcourier@gmail.com',
                    pass: 'Knz@1628'
                }
            });             
        
            let mailDetails = {
                from: 'knzcourier@gmail.com',
                to:senderemail,
                subject: 'Collected',
                // text: `Your parcel Referance Number ${updateData.referancenumber} is delivered...!
                // Thank you for being our valued customer.
                //  We are so grateful for the pleasure of serving you and hope we met your expectations.`,
               html:`Your Parcel is Accepted By KNZ Courier Service.<br/>
               <br/>
               Thank You For Choosing Our Service.🙂<br/>
               <br/>
               Your parcel number is
               <b style='color: blue; font-size: 18px;'> ${referancenumber} </b>And You Can Track Your Parcel Details On Our Official Website.</br>
                <br/>
               <br/>
               Thank You
               <br/>
               KNZ Courier Service
                     `,
                // template:'index'
            };


            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    console.log('Error Occurs', err);
                } else {
                    console.log('Email sent successfully');
                }
            });



        }
        else {
            res.status(400).json({ message: "fail to add" })
        }

    }
    catch (error) {
        console.log(error);
    }
})

router.get("/parcelinfo", async (req, res) => {
    const ParcelData = await Parcel.find();
    return res.status(200).send({
        status: true,
        message: 'Fetch Successfully.',
        ParcelData
    })
})
router.delete("/deleteparcelData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const delData = await Parcel.findByIdAndDelete(id);
        await DestinationParcel.deleteOne({referancenumber:delData.referancenumber})
        await StaffParcel.deleteOne({referancenumber:delData.referancenumber})
        
        if (delData) {
            res.status(200).json({ message: "delete successful" })
        }
        else {
            res.status(400).json({ message: 'fail to delete' })
        }
    } catch (error) {

    }
})
router.put("/updateparcelstatus/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const {branchparcelstatus,mainparcelstatus}=req.body
        console.log(req.body);
        
        const updateData = await Parcel.findByIdAndUpdate(id,{branchparcelstatus:branchparcelstatus,mainparcelstatus:mainparcelstatus}, {
            new: true
        })
        if(updateData.branchparcelstatus == "Collected"){
            const supdateData = await DestinationParcel.updateOne({referancenumber:updateData.referancenumber},{parcelstatus:"Collected"}, {
                new: true
            })
        }
        if(updateData.branchparcelstatus == "Dispatch"){
            const supdateData = await DestinationParcel.updateOne({referancenumber:updateData.referancenumber},{parcelstatus:"Pending"}, {
                new: true
            })
        }
        // if(updateData.branchparcelstatus == "Collected"){
        //     const supdateData = await DestinationParcel.updateOne({referancenumber:updateData.referancenumber},{parcelstatus:"Collected",receivedate:moment(updateData.updatedAt).format('L')}, {
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
router.get("/parcedata/:branchname", async (req, res) => {
    // const referancenumber=req.params.referancenumber;
    const parceldate= req.params.pdate;
    // moment(updatedAt).format('LL')
    //  const fdate = updatedAt.toISOString().split('T')[0]
    //  console.log('new date is',fdate);
    
    // const parceldate=req.params.pdate;
    const branchname = req.params.branchname;
    // const ParcelData = await Parcel.find({referancenumber:referancenumber});
    const branchdata= await Parcel.find({branchprocessed:branchname})
    const receivedata= await DestinationParcel.find({pickupbranch:branchname})
    if(branchdata){
        return res.status(200).send({
            status: true,
            message: 'Fetch Successfully.',
            // ParcelData,
            branchdata,
            receivedata
        })
    }
    else{
         res.status(400).send("No Data");
    }
    
})

router.post("/adminlogin", async(req,res)=>{
    const admin = new Admin({
        username:req.body.username,
        password:req.body.password
    })
    const register = await admin.save();
    if(register){
        res.send(register);
    }
})


router.get("/showdata", async (req, res) => {
    const totalbranch = await Branch.find().count();
    const branchinfo = await Branch.find()
    const totalparcel = await Parcel.find().count();
    const totalstaff = await Staff.find().count();
    const tcollected = await Parcel.find({parcelstatus:"Collected"}).count();
    const tshipped = await Parcel.find({parcelstatus:"Shipped"}).count();
    const tpickup = await Parcel.find({parcelstatus:"Pick-up"}).count();
    const tdispatch = await Parcel.find({parcelstatus:"Dispatch"}).count();
    const tdelevered = await Parcel.find({parcelstatus:"Delivered"}).count();
    
    return res.status(200).send({
        totalbranch,
        totalparcel,
        totalstaff,
        tcollected,
        tshipped,
        tpickup,
        tdispatch,
        branchinfo,
        tdelevered
    })
})

router.get("/branchdata/:branchname", async (req, res) => {
    const branchname=req.params.branchname;
    const branchdata = await Branch.find({branchname:branchname});
    const stfdata = await Staff.find({branchname:branchname})
    const prdata = await Parcel.find({branchprocessed:branchname})
    const rdata = await DestinationParcel.find({pickupbranch:branchname,parcelstatus:"Received"})
    const prcount=await Parcel.find({branchprocessed:branchname}).count();
    const rcount = await DestinationParcel.find({pickupbranch:branchname,parcelstatus:"Received"}).count();
    const maincount=prcount+rcount;

    const totalparcel = await Parcel.find({pickupbranch:branchname}).count()
    const totalstaff = await Staff.find({branchname:branchname}).count()
    console.log('totalparcel',totalparcel);
    console.log('totalstaff',totalstaff);
    if(branchdata){
        return res.status(200).send({
            status: true,
            message: 'Fetch Successfully.',
            branchdata,
            stfdata,
            prdata,
            rdata,
            maincount,
            prcount,
            rcount,
            totalparcel,
            totalstaff
        })
    }
    else{
         res.status(400).send("No Data");
    }
    
})


// router.put("/updatepassword", async (req, res) => {
//     try {
//       const { username, password } = req.body
//     //   console.log("usernm:",password);
//       const userValid = await Admin.findOne({ username : username })
      
//       // console.log("uservalid pass", userValid);
//       if (!userValid) {
//         return res.status(400).send({
//           status: false,
//           message: 'User Not Exist.'
//         })
//       }
//       else{
//       const salt = await bcrypt.genSalt(10)
//       const pwd = await bcrypt.hash(password, salt)
  
//       const updateData = await Admin.findOneAndUpdate({username:userValid.username},{ password: pwd }, {
//         new: true
//       })
   
//       if (updateData) {
//         res.status(200).send({ message: "update successfully,," })
//       }
//       else {
//         res.status(424).send({ message: "failed to update" })
//       }
//     }} catch (error) {
//       console.log(error);
//     }
//   })


module.exports = router;
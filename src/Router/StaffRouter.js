const Branch = require('../model/AddBranch');
const express = require('express')
const Staffrouter = express.Router();
const { generateToken } = require('../service/token')
const { validate } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Parcel = require('../model/parcelSchema');
const Staff = require('../model/staffSchema');
const StaffParcel = require('../model/StaffParcelSchema');
const DestinationParcel = require('../model/DestinationSchema');
const moment = require('moment');
const nodemailer = require('nodemailer');
const Forgotpass = require('../model/ForgotPass')

require('dotenv').config();

Staffrouter.put("/staffloginupdate/:id", async (req, res) => {
    const id = req.params.id;
    var update = req.body;
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const updateData = await Staff.findByIdAndUpdate(id, update, {
        new: true
    })
    if (updateData) {
        res.send(updateData);
    }
})

Staffrouter.post('/stafflogin', async (req, res) => {
    try {
        const { username, password } = req.body

    const userValid = await Staff.findOne({ username: username })
    const ismatch = await bcrypt.compare(password, userValid.password);

    if (!userValid) {
        return res.status(401).send({
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
            const payload = { username: username, type: "staff" }
            const stafftoken = generateToken(payload)
            return res.status(200).send({
                status: true,
                message: 'Log in Successfully.',
                stafftoken
            })
        }
    }
    } catch (error) {
        return res.status(400).send(error);
 
    }

});
Staffrouter.get('/sloggedin', validate, async (req, res) => {
    const { username } = req.decoded

    const userValid = await Staff.findOne({ username })
    return res.status(200).send({
        status: "Loggred in Successfully.",
        userValid
    })
})

Staffrouter.get('/staffparceldata/:username', async (req, res) => {
    const username = req.params.username.trim();
    // console.log(username);
    const staffdata = await StaffParcel.find({ assignto: username, parcelstatus: "Received",branchparcelstatus:"Received" })
    const staffdatadelivere = await StaffParcel.find({ assignto: username, branchparcelstatus: "Delivered" })

    // const totaldispatch=await Parcel.find({assignto:username,parcelstatus:"Dispatch"}).count();

    if (staffdata) {
        return res.status(200).send({
            status: true,
            message: "fetch successfully..",
            staffdata,
            staffdatadelivere


        })
    }
    else {
        res.status(400).send("No Data")
    }
})

Staffrouter.put("/updatestaffparcelstatus/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.body);

        const updateData = await StaffParcel.findByIdAndUpdate(id, req.body, {
            new: true
        })
        if (updateData.branchparcelstatus == "Delivered") {
            const supdateData = await DestinationParcel.updateOne({ referancenumber: updateData.referancenumber }, { branchparcelstatus: "Delivered",flag:1,deliverydate: moment(updateData.updatedAt).format('L') }, {
                new: true
            })
            await StaffParcel.findByIdAndUpdate(id, { deliverydate: moment(updateData.updatedAt).format('L') }, {
                new: true
            })

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
                    to: updateData.senderemail,
                    subject: 'Delivered',
                    // text: `Your parcel Referance Number ${updateData.referancenumber} is delivered...!
                    // Thank you for being our valued customer.
                    //  We are so grateful for the pleasure of serving you and hope we met your expectations.`,
                   html:`<b style='color: black; font-size: 18px;'>Your parcel number ${updateData.referancenumber} is delivered ✔ :)</b></br>
                    <br/>
                   <br/>
                     Thank you for being our valued customer.🙂<br/><br/>
                     We are so grateful for the pleasure of serving you and hope we met your expectations. 👍 `,
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
        if (updateData.branchparcelstatus == "Received") {
            const supdateData = await DestinationParcel.updateOne({ referancenumber: updateData.referancenumber }, { branchparcelstatus: "Ready To Delivere",flag:"0" }, {
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

Staffrouter.get('/staffreport/:staffname', async (req, res) => {
    const staffname = req.params.staffname.trim();
    // console.log(username);
    const staffdata = await StaffParcel.find({ assignto: staffname, $or: [{ parcelstatus: "Received" }, { branchparcelstatus: "Delivered" }] })
    if (staffdata) {
        return res.status(200).send({
            status: true,
            message: "fetch successfully..",
            staffdata,
        })
    }
    else {
        res.status(400).send("No Data")
    }
})
Staffrouter.post('/sendotp',async(req,res)=>{
    const {result,email,username}=req.body;
    const data = new  Forgotpass({
        email:email,
        otp:result,
        username:username
    })
    const savedata = await data.save();

    if(savedata){
        res.status(200).send()

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
                    to: email,
                    subject: 'Your OTP',
                    text: `${result} is your login recovery code`
                };

                mailTransporter.sendMail(mailDetails, function (err, data) {
                    if (err) {
                        console.log('Error Occurs', err);
                    } else {
                        console.log('Email sent successfully');
                    }
                });


    }
    else{
        res.status(400).send
    }
})

Staffrouter.post('/verifyotp',async(req,res)=>{
    const {otp,email,username}=req.body;
    console.log("req:",req.body);
    const userValid = await Forgotpass.findOne({ username: username,otp:otp })

    if(userValid){
        const data = await Staff.find({ username:userValid.username })
        console.log("uservalid",userValid.username);
        if(data){
            const payload = { username: username, type: "staff" }
                const stafftoken = generateToken(payload)
                return res.status(200).send({
                    status: true,
                    message: 'Log in Successfully.',
                    stafftoken
                })
        }
        else{
            res.status(400).send();
        }
    }
   if(!userValid){
    res.status(400).send();
   }
})

Staffrouter.get('/staffnotification/:staffname',async(req,res)=>{
    const stfnm=req.params.staffname;
    const notificationdata = await StaffParcel.find({assignto:stfnm,flag:1})
    const countnotify=await StaffParcel.find({assignto:stfnm,flag:1}).count();
    if (notificationdata) {
        return res.status(200).send({
            status: true,
            message: "fetch successfully..",
            notificationdata,
            countnotify

        })
    }
    else {
        res.status(400).send("No Data")
    }
})
Staffrouter.put("/staffclose/:staffnm",async(req,res)=>{
    const staffnm=req.params.staffnm
    const updatedata=await StaffParcel.updateMany({assignto:staffnm},{flag:0},
     {
        new: true
    })

     if(updatedata){
            res.status(200).send({
                updatedata
            })
        }
})
Staffrouter.put("/updatestaffpassword", async (req, res) => {
    try {
        const { username, password } = req.body
        // console.log('pwd',password);
        const branchuser = await Staff.findOne({ username : username });
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

            const branchdata = await Staff.findOneAndUpdate({ username: branchuser.username }, { password: bpwd }, {
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

Staffrouter.get('/stfprofile/:username', async (req, res) => {
    const username = req.params.username.trim();
    // console.log(username);
    const staffdata = await Staff.findOne({username:username})
    if (staffdata) {
        return res.status(200).send({
            status: true,
            message: "fetch successfully..",
            staffdata,
        })
    }
    else {
        res.status(400).send("No Data")
    }
})

module.exports = Staffrouter;
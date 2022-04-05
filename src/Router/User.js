const express = require('express');
const Parcel = require('../model/parcelSchema');
const UserRouter = express.Router();
const StaffParcel = require('../model/StaffParcelSchema');
const DestinationParcel = require('../model/DestinationSchema');
const User = require('../model/UserSchema');

UserRouter.post("/addcomment", async (req, res) => {
    const { firstname, lastname,contactno, email,problem, comment,rating } = req.body;
    try {
        const user = new User({
            firstname,
            lastname,
            contactno,
            email,
            problem,
            comment,
            rate:rating
        })
        const register = await user.save();
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
UserRouter.get("/comment", async (req, res) => {
    const commentData = await User.find();
    return res.status(200).send({
        status: true,
        message: 'Fetch Successfully.',
        commentData
    })
})
UserRouter.get("/trackparcel/:referancenumber", async (req, res) => {
    const referancenumber = req.params.referancenumber;
    const userref = await Parcel.findOne({ referancenumber: referancenumber });

    const parceldata = await Parcel.findOne({ referancenumber: referancenumber })
    const destinationdata = await DestinationParcel.findOne({ referancenumber: referancenumber })
    const staffparceldata = await StaffParcel.findOne({ referancenumber: referancenumber })
    if (!userref) {
        return res.status(400).send({
            status: true,
            message: 'Reference No. Not Exist.'
        })
    }
    else {
        return res.status(200).send({
            status: "Fetch successfully",
            parceldata,
            destinationdata,
            staffparceldata,
            userref
        })
    }


})
UserRouter.delete("/deleteUserData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const delData = await User.findByIdAndDelete(id);
        if (delData) {
            res.status(200).json({ message: "delete successful" })
        }
        else {
            res.status(400).json({ message: 'fail to delete' })
        }
    } catch (error) {

    }
})


module.exports = UserRouter
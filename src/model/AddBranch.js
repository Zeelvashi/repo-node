const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema

const BranchSchema = new Schema({
    branchname: {
        type: String
    },
    branchaddress: {
        type: String
    },
    branchcontactnumber: {
        type: Number
    },
    branchemail: {
        type: String
    },
    city: {
        type: String
    },
    zipcode: {
        type: Number
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
},
    {
        timestamps: true
    }
)

BranchSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // console.log(`current password ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`current password ${this.password}`);

    }
    next();
})

const Branch = new mongoose.model("Branch", BranchSchema);

module.exports = Branch;
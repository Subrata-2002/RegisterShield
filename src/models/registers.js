const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    add: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmpassword: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

// whenever you work with instance you have to use method 
employeeSchema.methods.generateAuthToken = async function () {
    try {
        // console.log(this._id);
        const mytoken = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: mytoken });
        await this.save();

        // console.log(mytoken);
        return mytoken;
    }
    catch (error) {
        res.send("The error part " + error);
        // console.log(error)
    }
}

// converting password into hash 
employeeSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        // console.log(`The current password is ${this.password}`);// this is template literal(``)
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`The hashed password is ${this.password}`);

        // this.confirmpassword = undefined;
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})



//now we need to create a collection

const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;
const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req, res, next)=>{

    // try {

    //     const token = req.cookies.jwt
    //     const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

    //     console.log(verifyUser);

    //     const user =await Register.findOne({_id:verifyUser._id});
    //     console.log(user);
    //     next();

    // } catch (error) {
    //     res.status(401).send(error);
    // }
    try {
        const token = req.cookies.jwt;
        if (!token) {
            throw new Error('Please login first');
        }
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const user = await Register.findOne({ _id: verifyUser._id });
        if (!user) {
            throw new Error('Please login first');
        }
        req.user = user;
        next();
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/login');
    }
}

module.exports = auth;
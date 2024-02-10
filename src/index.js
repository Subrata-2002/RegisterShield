require('dotenv').config();
require("./db/conn");
const auth = require("./middleware/auth");
const express = require("express");
const body_parser = require("body-parser");
const cookieParser = require("cookie-parser");

const session = require("express-session");
const flash = require("connect-flash");

const bcrypt = require("bcryptjs");
const port = process.env.PORT || 3000;
const path = require("path");


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// console.log(process.env.SECRET_KEY);
const Register = require("./models/registers");
// const { Template } = require("ejs");

const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));

app.use(session({
    secret: "SecretStringForSession",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}))

app.use(flash());
app.use(cookieParser());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
   
    res.render("templates/home");

})

app.get("/secret", auth, (req, res) => {
  
    res.render("templates/secret");
});

app.get("/signup", (req, res) => {

    const messages = req.flash();
    res.render("templates/mysignup", { messages });

})

app.get("/login", (req, res) => {
    // res.render("templates/login");

    const messages = req.flash();
    res.render("templates/login", { messages });

    app.get("/register",(req, res)=>{
    res.render("templates/mysignup");

    })
})

app.get("/logout", auth, async(req, res) => {

    try {
        res.clearCookie("jwt");
        console.log("logout successfully...");
        res.redirect("/login");
        
    } catch (error) {
        res.status(500).send(error);
    }
    

})

app.post("/insert", async (req, res) => {

    try {
        const memregister = new Register({
            username: req.body.username,
            email: req.body.email,
            mobile: req.body.mobile,
            add: req.body.add,
            password: req.body.password,
            confirmpassword: req.body.confirmpassword,
            gender: req.body.gender
        });

        // console.log(memregister);
        if (memregister.password !== memregister.confirmpassword) {

            req.flash('error', 'Password and confirm password does not match.');
            // console.log(req.flash());
            res.redirect("/signup");

            //  res.send("Password and confirm password do not match.")
        }
        else if (memregister.mobile.length < 10 || memregister.mobile.length > 10) {
            req.flash('error', 'Please Enter a Valid Mobile No.');
            // console.log(req.flash());
            res.redirect("/signup");

        }
        else {
            // console.log(memregister.username);


            const token = await memregister.generateAuthToken();
            // console.log(token);


            // The req.cookie() function is used to set the cookie name to value
            // The value parameter may be a string or object converted to JSON

            // res.cookie(name , value , [option])
            res.cookie("jwt" , token  ,{
                expires : new Date(Date.now() + 30000),
                httpOnly :true
             });
            // console.log(cookie);
            
            // password hash 
            const savemember = await memregister.save();
            req.flash('success', 'You have registered successfully!');
            // console.log(savemember);
            // res.send("Data saved");
            res.redirect("/signup");
        }

    } catch (error) {
        req.flash('error', 'An error occurred.');
        // res.status(403).send(error);
        // console.log(error);
        res.redirect("/signup");
    }
})

app.post("/mylogin", async (req, res) => {

    try {
        const Email = req.body.email;
        const pwd = req.body.password;

        const logindata = await Register.findOne({ email: Email });

        // for checking that hashed pwd 

        if (!logindata) {
            // return console.log("user not found");
            req.flash('error', 'User not found!!  Please Register First');

            // res.status(400).send("User not found");
            // console.log("user not found");
            res.redirect("/login");
        }

        // Check if the provided name matches the stored name
        // else if (logindata.password !== pwd) 
        else  {
            const isMatch = await bcrypt.compare(pwd, logindata.password);
            
            // console.log(isMatch);
            if (isMatch === false) {
                req.flash('error', 'Authentication failed');
                res.redirect("/login");
            } 
            else {
                const token = await logindata.generateAuthToken();
                // console.log("The token part is "+token);
    
               res.cookie("jwt" , token  ,{
                    expires : new Date(Date.now() + 600000),
                    httpOnly :true,
                    // secure :true
                 });
                //  console.log(`This is the cookie ${req.cookies.jwt}`);
               
                req.flash('success', 'Successfully logged in!');
                res.redirect("/login");
            }

        }

    }

    catch (error) {
        req.flash('error', 'An error occurred.');
       
        res.redirect("/mylogin");

    }
})

app.get("/register",(req,res)=>{
    res.redirect("signup");
})
app.listen(port, () => {
    console.log(`server is listining to port number :${port}`);
})
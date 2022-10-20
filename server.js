"use strict";
const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
const path = require("path");
var bcrypt = require("bcrypt");
var passport = require("passport");
const accessTokenSecret = "youraccesstokensecret";
const router = express.Router();
const multer = require("multer");
const upload_file = require("./image_helper"); // It has Code for Image
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const jwt = require("jsonwebtoken");
var token = jwt.sign(
    { foo: "bar" },
    "Akashisthebastpersonofimggelobalinfotechjaipur"
);
//console.log(token,'token');
//use to get body data start //
// trust first proxy

app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: true,
        saveUninitialized: true,
        cookie: { secure: true },
        cookie: {
            // Session expires after 1 min of inactivity.
            // expires: 6000,
        },
    })
);

const bodyParser = require("body-parser");
app.use(require('flash')());
const { strict } = require("assert");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());
//use to get body data end //

const staticpath = path.join(__dirname, "/public");
/***********mongodb connection************************************/

app.use(express.static(staticpath));

mongoose.connect(process.env.DATABASE_URL);
var db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("connection succeeded");
});
//**********************************************************************/

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
//const auth=require("./middleware")



//******************Register start********************//
app.get("/", (req, res) => {
    res.render(`Register`);
});
app.get("/sendlogindata",(req,res)=>{
    res.redirect('/')
})

app.post("/sendRegisterdata", upload_file.single("image"), async (req, res, next) => {
    //var data = new admin();
    var fullname = req.body.fullname;
    var email = req.body.setemail;
    var setusername = req.body.setusername;
    var setpassword = req.body.setpassword;
    var uplordimage = req.file.filename;
    let findemail = await db.collection(process.env.DATABASE_COLLECTION).findOne({setemail:email});
   
    if (findemail) {
       
        res.send("used email please enter new email")
    }
    else{
    const hash = bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(setpassword, salt, (err, hash) => {
            var registerdata = {
                fullname: fullname,
                setemail: email,
                username: setusername,
                setpassword: hash,
                imagename: uplordimage,
            };
            db.collection(process.env.DATABASE_COLLECTION).insertOne(registerdata, function (err, collection) {
                if (err) throw err;
                console.log("Record inserted Successfully");
            }
            );


        });
    });
    res.redirect('/login');
}
});
//******************Register end ********************//

//******************login start********************//
app.get("/login", (req, res) => {
    res.render(`login`);
});

app.post("/sendlogindata", async (req, res) => {
    console.log(req.body, "bodydata");
    var  loginemail = req.body.loginemail;
    var passwword = req.body.passwword;

    // var setemail = req.body.loginemail;
    let gethuserdata = await db.collection(process.env.DATABASE_COLLECTION).findOne({ setemail:loginemail});
    if (!gethuserdata) {
        return res.redirect("/login");
    } else {
        bcrypt.compare(
            passwword,
            gethuserdata.setpassword,
            function (err, boolean) {
                console.log(boolean, "gethuserdata.setpassword");
                if (boolean !== true) {
                    return res.redirect("/login");
                } else {
                    req.session.user = gethuserdata;
                    req.session.isAuth = true;
                    console.log(req.session.user,'session data')
                    res.render('homepage');
                }
            }
        );
    }
});

//******************login end ********************//
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });

app.listen(port, () => {
    console.log(`App listening at port ${port}`);
});
module.exports = router;

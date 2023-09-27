require('dotenv').config();
const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session = require('express-session')
const passport=require('passport');
const passportLocalMongoose = require('passport-local-mongoose')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
    secret: 'emiliabestgirl',
    resave: false,
    saveUninitialized: false
  }))
app.use(passport.initialize());
app.use(passport.session());  

mongoose.connect('mongodb://127.0.0.1:27017/hotTakeDB');

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose, {usernameField:'email'}); //we need to mention the field that will act as username
                                 //default is "username". It needs to be same as the input name in frontend for some reason.

const User=mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req, res)=>{
    res.render("home");
});

app.get("/login",(req, res)=>{
    res.render("login");
});

app.get("/register",(req, res)=>{
    res.render("register");
});

app.post("/register", (req, res)=>{
    const addEmail=req.body.email;
    const addPassword=req.body.password;
    const addUser=new User({
        email: addEmail
    })
    User.register(addUser, addPassword, function(err, user) {
        if (err){ 
            console.log(err); 
            res.redirect("/");
        }
        else{
            console.log("successfully registered");
            passport.authenticate("local")(req, res, function() {
                res.redirect("/hottakes");
            });
        }
    })
});

app.get("/hottakes", (req, res) => {
    console.log(req.user);
    console.log(req.session);
    if(req.isAuthenticated())
        res.render("hottakes");
    else
        res.redirect("/");
})

// app.post("/login", passport.authenticate("local",{successRedirect: "/hottakes", failureRedirect: "/"}));

app.post('/login', passport.authenticate('local', { failureRedirect: '/', failureMessage: true }), function(req, res){
    res.redirect('/hottakes');
});

app.post('/logout', function(req, res){
    req.logout(function(err) {
        if (err){ 
            console.log(err);
        }
        else{
            res.redirect('/');
        }
    });
});

app.listen(3000, ()=>{
    console.log("Server running at port 3000");
})
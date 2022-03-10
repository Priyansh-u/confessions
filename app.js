const express =require("express");
const bodyParser = require("body-parser");
const app=express();
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(session({
    secret:"How dare you buddy.",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/UsersDb");
const userschema= new mongoose.Schema({
    email:String,
    password:String,
    secrets:String
});
userschema.plugin(passportLocalMongoose);
const users= mongoose.model("users",userschema);
passport.use(users.createStrategy());
passport.serializeUser(users.serializeUser());
passport.deserializeUser(users.deserializeUser());
app.get("/",function(req,res){
    res.render("home");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/login",function(req,res){
    res.render("login");
});

app.get("/secrets",function(req,res){
users.find({secrets:{$ne:null}},function(err,foundones){
    if(err){ console.log(err);}
    else{
        res.render("secrets",{secretsaway:foundones});
    }
});
});
app.post("/register",function(req,res){
    users.register({ username:req.body.username},req.body.password,function(err,newuser){
        if(err){ console.log(err); res.redirect("/register");}
        else{  passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets");
        });};
    });
    
    });
    app.post("/login",function(req,res){
       let newuser=new users({
            username:req.body.username,
            password:req.body.password
        });
        req.login(newuser,function(err){
            if(err){console.log(err);}
        else{
           passport.authenticate("local")(req,res,function(){
               res.redirect("/secrets");
           });
        };
        });
    });
   
    app.get("/logout",function(req,res){
        req.logout();
        res.redirect("/");
    });
    app.get("/submit",function(req,res){
        if(req.isAuthenticated()){ 
          res.render("submit");
        }else{   res.redirect("/login");}
    });
    app.post("/submit",function(req,res){
             console.log(req.user);
        users.findById(req.user._id,function(err,found){
            if(err){console.log(err);}
            else{  if(found){
                found.secrets=req.body.secret;
                found.save(function(err){
                    if(err){console.log(err);}
                    else{  res.redirect("/secrets");}
                });
            }}
        });
    });
    app.listen("3000",function(){
        console.log("Server started at the port 3000");
    });
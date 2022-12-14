//jshint esversions:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); 

const app = express(); 

// ready {body, ejs and public}
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(session({
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: false 
}))

app.use(passport.initialize());
app.use(passport.session());

let net = "mongodb+srv://Author-Godstime:etineh@cluster0.7gbm4of.mongodb.net"
mongoose.connect(net+"/pixelEventDB", {useNewUrlParser: true});

// mongoose.connect("mongodb://0.0.0.0:21017/eventDB", {useNewUrlParser: true})

/////////// login setup //////////////
const user_Schema = new mongoose.Schema({
    fullName: String
});
user_Schema.plugin(passportLocalMongoose);

const User_Model = mongoose.model("User", user_Schema)
//serializeUser and deserializeUser
passport.use(User_Model.createStrategy());
passport.serializeUser(User_Model.serializeUser()); 
passport.deserializeUser(User_Model.deserializeUser());

// passport.serializeUser((user, done)=> {
//     done(null, user.id);
// });
// passport.deserializeUser(function(id, done) {
//     User_Model.findById(id, (err, user)=>{
//         done(err, user);
//     });
// });


const itemSchema = new mongoose.Schema({
    name: String,
    userId: String
})
const ItemModel = mongoose.model("Event", itemSchema)

const workSchema = new mongoose.Schema({
    name: String,
    userId: String
})
const WorkModel = mongoose.model("Work", workSchema);

const studySchema = new mongoose.Schema({
    name: String,
    userId: String
})
const StudyModel = mongoose.model("study", studySchema);

const planSchema = new mongoose.Schema({
    name: String,
    userId: String
})
const PlanModel = mongoose.model("plan", planSchema);

let itemAdd = "", itemAdd2 = "", itemStudy = "", itemPlan = "";
let check = "", editId, editCheck = 0, taskHolder = ""

app.get("/event", (req, res) =>{
    if(req.isAuthenticated()){
        ItemModel.find({"userId": req.user.id}, (err, displayItem)=>{  
            res.render("list", {enterTask: taskHolder, KindOfDay:`Welcome ${req.user.fullName}`, taskItems: displayItem, valid:"event"})
            taskHolder = ""
        })    
    } else {
        check === "reg" ? res.render("login_signup", {viewDisplay1: "Login Now!"})
        : check === "log" ? res.render("login_signup", {viewDisplay1: "invalid login!"})
        : res.render("login_signup", {viewDisplay1: "Register First!"});
    }
       
});
/// ErrorCaptureStackTrace(err); --- means no internet
app.get("/login_signup", (req, res)=>{
    res.render("login_signup", {viewDisplay1: "Sign-Up"});
})
//////////////////////   login and signup code    /////////////////////////
app.post("/login_signup", (req, res)=>{
     check1 = req.body.check
    let formName = req.body.fName
    /////  fun time -- check1 is undefined, yet it's working... lol
    if(check1){
        check = "reg"
        User_Model.register({username: req.body.username}, req.body.password, (err, user)=>{
            if(err){
                res.render("login_signup", {viewDisplay1: "Email already exist. Login!"});
                console.log(err)
            } else {
                passport.authenticate('local')(req, res, ()=>{
                    user.fullName = formName
                    user.save()
                    res.redirect("/event")
                })
            }
        })
    } else {
        check = "log"
        const user1 = new User_Model({
            username: req.body.username,
            password: req.body.password
        })
        req.logIn(user1, (err, user)=>{
            if(err){
                res.render("login_signup")
                console.log(err)
            } else{
                passport.authenticate("local")(req, res, ()=>{
                    res.redirect("/event")
                })
            }
        })
    }
    
}) 

app.get("/", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("home", {header1: `hello! ${req.user.fullName}...`, header2:""})
    } else {
        res.render("home", {header1: "signup/login", header2:"login_signup"})
    }
    
})

///////////     edit function /////////////////
app.post("/edit", (req, res)=>{
    let validCheck = req.body.edit
    let checkId = validCheck.slice(0,24)
    let validPage = validCheck.slice(24)
        editCheck = 1
        editId = checkId
    if(validPage === "work"){
        WorkModel.findById(checkId, (err, seen)=>{
            !err ? taskHolder = seen.name : null
        })
        res.redirect("/work")
    } else if(validPage === "study"){
        StudyModel.findById(checkId, (err, seen)=>{
            !err ? taskHolder = seen.name : null
        })
        res.redirect("/study")
    } else if(validPage === "plan"){
        PlanModel.findById(checkId, (err, seen)=>{
            !err ? taskHolder = seen.name : null
        })
        res.redirect("/plan")
    } else {
        ItemModel.findById(checkId, (err, seen)=>{
            !err ? taskHolder = seen.name : null
        })
        res.redirect("/event")
    } 
})

///////////     delete function /////////////////
app.post("/delete", (req, res)=>{
    let validCheck = req.body.checkbox
    let checkId = validCheck.slice(0,24)
    let validPage = validCheck.slice(24)
    if(validPage === "work"){
        WorkModel.findByIdAndRemove(checkId, (err)=>{
            res.redirect("/work")
        })
    }else if(validPage === "study"){
        StudyModel.findByIdAndRemove(checkId, (err)=>{
            res.redirect("/study")
        })  
    }else if(validPage === "plan"){
        PlanModel.findByIdAndRemove(checkId, (err)=>{
            res.redirect("/plan")
        })  
    } else {
        ItemModel.findByIdAndDelete(checkId, (err)=>{
            res.redirect("/event")
        })
    }
})

/////////////    All Page Post.. #edit or #save     ////////////////
app.post("/event", (req, res)=> {
    itemAdd = new ItemModel({
        name: req.body.task,
        userId: req.user.id
    });

    itemStudy = new StudyModel({
        name: req.body.task,
        userId: req.user.id
    });

    itemPlan = new PlanModel({
        name: req.body.task,
        userId: req.user.id
    })
    
    itemAdd2 = new WorkModel({
        name: req.body.task,
        userId: req.user.id
    })
    
    let validPage = req.body.button
    if(validPage === "work"){
        if(editCheck){
            WorkModel.findByIdAndUpdate(editId, {name: req.body.task}, (err)=>{
                !err ? res.redirect("/work") : null;
                editCheck = 0;
            })
        } else{
            itemAdd2.save()
            res.redirect("/work");
        }
    } else if(validPage === "study"){
        if(editCheck){
            StudyModel.findByIdAndUpdate(editId, {name: req.body.task}, (err)=>{
                !err ? res.redirect("/study") : null;
                editCheck = 0;
            })
        } else{
            itemStudy.save()
            res.redirect("/study");
        }
    } else if(validPage === "plan") {
        if(editCheck){
            PlanModel.findByIdAndUpdate(editId, {name: req.body.task}, (err)=>{
                !err ? res.redirect("/plan") : null;
                editCheck = 0;
            })
        } else{
            itemPlan.save()
            res.redirect("/plan");
        }
    } else {
        if(editCheck){
            ItemModel.findByIdAndUpdate(editId, {name: req.body.task}, (err)=>{
                !err ? res.redirect("/event") : null;
                editCheck = 0;
            })
        } else{
            itemAdd.save()
            res.redirect("/event");
        }
    }
 
});

/////////////    All Pages Get     ////////////////
app.get("/work", (req, res) => {
    if(req.isAuthenticated()){
        WorkModel.find({"userId": req.user.id}, (err, displayWork)=>{
            res.render("list", {enterTask: taskHolder, KindOfDay: `Welcome ${req.user.fullName}`, taskItems: displayWork, valid:"work"})
            taskHolder = ""
        })
    } else {
        check === "reg" ? res.render("login_signup", {viewDisplay1: "Login Now!"})
        : check === "log" ? res.render("login_signup", {viewDisplay1: "invalid login!"})
        : res.render("login_signup", {viewDisplay1: "Register First!"});
    }
    
});

app.get("/study", (req, res)=>{
    if(req.isAuthenticated()){
        StudyModel.find({"userId": req.user.id}, (err, displayWork)=>{
            res.render("list", {enterTask: taskHolder, KindOfDay: `Welcome ${req.user.fullName}`, taskItems: displayWork, valid:"study"})
            taskHolder = ""
        })
    } else {
        check === "reg" ? res.render("login_signup", {viewDisplay1: "Login Now!"})
        : check === "log" ? res.render("login_signup", {viewDisplay1: "invalid login!"})
        : res.render("login_signup", {viewDisplay1: "Register First!"});
    } 
})

app.get("/plan", (req, res)=>{
    if(req.isAuthenticated()){
        PlanModel.find({"userId": req.user.id}, (err, displayWork)=>{
            res.render("list", {enterTask: taskHolder, KindOfDay: `Welcome ${req.user.fullName}`, taskItems: displayWork, valid:"plan"})
            taskHolder = ""
        })
    } else {
        check === "reg" ? res.render("login_signup", {viewDisplay1: "Login Now!"})
        : check === "log" ? res.render("login_signup", {viewDisplay1: "invalid login!"})
        : res.render("login_signup", {viewDisplay1: "Register First!"});
    }
    
})

app.get("/logout", (req, res)=>{
    req.logOut(err=>{
        !err ? res.redirect("/") : console.log(err)
    })
})

app.get("*",(req, res) => {
    res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, ()=>{
    console.log("Port 3000. Server have started running live!")
})

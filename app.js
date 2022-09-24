//jshint esversions:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express(); 

// ready {body, ejs and public}
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
let net = "mongodb+srv://Author-Godstime:etineh@cluster0.7gbm4of.mongodb.net"
mongoose.connect(net+"/todoDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name: String
})

const ItemModel = mongoose.model("Item", itemSchema)

const todo1 = new ItemModel({
    name: "Hit the '+' icon to add your task"
});
const todo2 = new ItemModel({
    name: "<-- click the 'checkbox' to delete>"
});
const todo3 = new ItemModel({
    name: "Meet up with your task!"
});

const arrayItem = [todo1, todo2, todo3]

const workSchema = new mongoose.Schema({
    name: String
})
const WorkModel = mongoose.model("Work", workSchema);

const studySchema = new mongoose.Schema({
    name: String
})
const StudyModel = mongoose.model("study", studySchema);

const planSchema = new mongoose.Schema({
    name: String
})
const PlanModel = mongoose.model("plan", planSchema);

let itemAdd = "", itemAdd2 = "", itemStudy = "", itemPlan = "";

app.get("/", (req, res) =>{

    ItemModel.find({}, (err, displayItem)=>{
        if(displayItem.length === 0){
            ItemModel.insertMany(arrayItem, (err)=>{
                if(err){
                    console.log(err)
                } else {
                    console.log("Successfully added to your DB.")
                }
            })
            res.redirect("/")
        } else {
            res.render("list", {KindOfDay:"Today", taskItems: displayItem})
        } 
    })       
});

app.post("/delete", (req, res)=>{
    
    let check = req.body.checkbox
    let part = req.body.hide
    if(part === "Your"){
        WorkModel.findByIdAndRemove(check, (err)=>{
            res.redirect("/work")
        })  
    }else if(part === "Study"){
        StudyModel.findByIdAndRemove(check, (err)=>{
            res.redirect("/study")
        })  
    }else if(part === "Plan"){
        PlanModel.findByIdAndRemove(check, (err)=>{
            res.redirect("/plan")
        })  
    } else {
        ItemModel.findByIdAndDelete(check, (err)=>{
            res.redirect("/")
        })
    }
})

app.post("/", (req, res)=> {
    
    itemAdd = new ItemModel({
        name: req.body.task
    });

    itemStudy = new StudyModel({
        name: req.body.task
    });

    itemPlan = new PlanModel({
        name: req.body.task
    })
    
    itemAdd2 = new WorkModel({
        name: req.body.task
    })
    
    let part = req.body.button
    if(part === "Your"){
        itemAdd2.save()
        res.redirect("/work");
    } else if(part === "Study"){
        itemStudy.save();
        res.redirect("/study");
    } else if(part === "Plan") {
        itemPlan.save();
        res.redirect("/plan");
    } else {
        itemAdd.save();
        res.redirect("/");
    }
 
});

app.get("/work", (req, res) => {
    let workday = "Your task is you"
    WorkModel.find({}, (err, displayWork)=>{
        res.render("list", {KindOfDay: workday, taskItems: displayWork})
    })
    
});

app.get("/study", (req, res)=>{
    let study = "Study to be approved"
    StudyModel.find({}, (err, displayStudy)=>{
        res.render("list", {KindOfDay: study, taskItems: displayStudy})
    })  
})

app.get("/plan", (req, res)=>{
    let plan = "Plan your day"
    PlanModel.find({}, (err, displayPlan)=>{
        res.render("list", {KindOfDay: plan, taskItems: displayPlan})
    })
    
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log("Hello. Server have started running live!")
})

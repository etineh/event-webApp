//jshint esversions:6

const express = require("express");
const bodyParser = require("body-parser");
const dayDate = require(__dirname +"/date.js");

const app = express(); 

// ready {body, ejs and public}
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

let item = "";
let itemArr = []
let workItem = []


app.get("/", (req, res) =>{
    let day = dayDate.dateD();
    res.render("list", {KindOfDay:"It's "+ day, taskItems: itemArr}) 
       
});

app.post("/", (req, res)=> {
    item = req.body.task;
    if(req.body.button === "Your"){
        workItem.push(item);
        res.redirect("/work");
    } else{
        itemArr.push(item);
        res.redirect("/");
    }
});

app.get("/work", (req, res) => {
    let workday = "Your task is you"
    res.render("list", {KindOfDay: workday, taskItems: workItem})
});
app.post("/work", (req, res) =>{
    let item = req.body.task;
    workItem.push(item)
    app.redirect("/work");
})



app.listen(3000, function(){
    console.log("Hello. I am running on port 3000")
})

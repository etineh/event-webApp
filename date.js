//jshint esversion:6

exports.dateD = ()=>{
    let today = new Date();
    let todayDay = today.getDay();
    let day = "";

    if(todayDay === 1){
        day = "Monday";
    } else if(todayDay === 2){
        day = "Tuesday";
    } else if(todayDay === 3){
        day = "Wednesday";
    } else if(todayDay === 4){
        day = "Thursday";
    } else if(todayDay === 5){
        day = "Friday";
    }else if(todayDay === 6){
        day = "Saturday";
    } else if(todayDay === 0){
        day = "Sunday";
    }
return day

}
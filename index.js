let express = require("express");
let app = express();
app.get("/",(req,res)=>{
    res.send("hello dear")
})
app.get("/about",(req,res)=>{
    res.send("about you self")
})
app.listen(4002,()=>{
    console.log("server is started localhost:4001")
})

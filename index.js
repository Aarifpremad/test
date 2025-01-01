let express = require("express");
let app = express();
app.get("/",(req,res)=>{
    res.send("hello dear")
})
app.listen(4001,()=>{
    console.log("server is started localhost:4001")
})

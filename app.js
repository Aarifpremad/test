let express = require("express")
const path = require('path');
const fs = require('fs');

let app = express();
let config = require("./config")
let index = require("./index")
let port = config.port
// let http = require("http")
// let server = http.createServer()
let router = require("./router/router")




app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.text({ type: '*/*' }));

app.use("/api",router.userRouter)
app.use("/",router.setting)
app.listen(4001,()=>{
console.log("server started in port:",4001)
})

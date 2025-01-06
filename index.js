let express = require("express")
const path = require('path');
const fs = require('fs');

let app = express();
let config = require("./config")
let port = config.port
// let http = require("http")
// let server = http.createServer()
let router = require("./router/router")

app.use((req, res, next) => {
    console.log("=== Incoming Request ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);
    console.log("Query Params:", req.query);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log("Body:", req.body);
    } else {
        console.log("Body: None");
    }
    console.log("========================");
    next();
});

console.log("yes this code is update it ")
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json())
app.use("/api",router.userRouter)
app.use("/",router.setting)
app.listen(port,()=>{
console.log("server started in port:",port)
})

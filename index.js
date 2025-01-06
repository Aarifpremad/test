let express = require("express")
const path = require('path');
const fs = require('fs');

let app = express();
let config = require("./config")
let port = config.port
// let http = require("http")
// let server = http.createServer()
let router = require("./router/router")

morgan.token('query', (req) => JSON.stringify(req.query));
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('headers', (req) => JSON.stringify(req.headers));

// Morgan format string to include method, URL, query, headers, and body
app.use(
    morgan(
        ':method :url :status :response-time ms - Query: :query - Body: :body - Headers: :headers'
    )
);

console.log("yes this code is update it ")
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json())
app.use("/api",router.userRouter)
app.use("/",router.setting)
app.listen(port,()=>{
console.log("server started in port:",port)
})

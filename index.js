let express = require("express")
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
let http = require("http")


let app = express();
let server = http.createServer(app)
const io = new Server(server);

let config = require("./config");
let socketauth = require("./service/auth").socketauth;
let socketevents = require("./socket/socket").socketevents;
let logger = require("./service/logger")
let routes = require("./routes");  


let port = config.port || 4001

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.get("/",(req,res)=>{
    res.render("login",{title :"login page"})
})


app.use(cors());
app.use(logger);
app.use(routes);  

io.use(socketauth);
io.on('connection', (socket) => {
    socketevents(socket, io);
});

server.listen(port,()=>{
console.log("server started in port:",port)
})

module.exports = io;
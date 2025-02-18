const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const https = require("https"); // Use HTTPS for secure connections
const http = require("http"); // Use HTTPS for secure connections
const session = require("express-session");
const multer = require("multer");

const config = require("./config");
const socketauth = require("./service/auth").socketauth;
const socketevents = require("./socket/socket").socketevents;
const logger = require("./service/logger");
const routes = require("./routes");

const app = express();
const port = config.port || 4001;

// SSL options for HTTPS
// const sslOptions = {
//   key: fs.readFileSync("/var/www/httpd-cert/aksasoftware.com_2024-10-13-11-36_59.key"),
//   cert: fs.readFileSync("/var/www/httpd-cert/aksasoftware.com_2024-10-13-11-36_59.crt"),
// };

// HTTPS server setup
// const server = https.createServer(sslOptions, app);
const server = http.createServer( app);

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your domain if necessary
    methods: ["GET", "POST"],
  },
});

// Session middleware
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, maxAge: 1000 * 60 * 60 }, // Secure must be true for HTTPS
  })
);

// Middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// app.use(logger);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("login", { title: "Login Page" });
});

app.use(routes);

// Multer configuration for file uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

// Upload routes
app.get("/upload-images", (req, res) => {
  res.render("uploadimages", { message: null });
});

app.post("/upload-images", upload.array("images", 10), (req, res) => {
  if (req.files && req.files.length > 0) {
    res.render("uploadimages", { message: "Images uploaded successfully!" });
  } else {
    res.render("uploadimages", { message: "Please select images to upload." });
  }
});

// Socket.IO setup
io.use(socketauth);
io.on("connection", (socket) => {
  socketevents(socket, io);
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});

module.exports = io;

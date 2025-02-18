let express = require("express");
let router = express.Router();

// Import the individual route files
let userRouter = require("./router/router");
let adminRouter = require("./adminroutes/admin.route");
let adminPageRouter = require("./adminroutes/admin.page.route");
let botsRouter = require("./adminroutes/bots.route");
let supportRouter = require("./adminroutes/suppot.conntent.notification");
let tournament = require("./adminroutes/tournament.router");
let poll  = require("./adminroutes/poll.router");
let bank  = require("./adminroutes/userbank.route");
let adminprofile  = require("./adminroutes/adminprofile.route");
let apipool = require("./router/tournamentpull.router")
let authenticate = require("./service/auth").authenticateToken;

let Model = require("./models/model") 
// Define adminroutes
router.use("/api",userRouter.userRouter)
router.use("/", adminRouter);


router.use("/",userRouter.setting)
router.use("/", adminPageRouter);
router.use("/", botsRouter);
router.use("/", supportRouter);
router.use("/", tournament);
router.use("/", poll);
router.use("/admin", adminprofile);
router.use("/api" ,bank);
router.use("/api" ,apipool);

// You can add more adminroutes here if needed


const { sendNotification, sendBulkNotification } = require("./firebase"); // Import notification functions

// Send notification to a single user
router.post("/send-notification", async (req, res) => {
  const { tokens, title, message, iconUrl } = req.body;
  if (!tokens || !title || !message) {
    return res.status(400).json({ error: "Missing required fields (tokens, title, or message)" });
  }

  try {
    await sendNotification(tokens, title, message, iconUrl);
    res.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Send notification to multiple users
router.post("/send-bulk-notification", async (req, res) => {
  const { tokens, title, body } = req.body;
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    await sendBulkNotification(tokens, title, body);
    res.json({ success: true, message: "Bulk notification sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send bulk notification" });
  }
});

// module.exports = router;

// get-users

// Get users
router.get("/get-users", async (req, res) => {
    try {
        // Assuming you have a User model to fetch users from the database
        const users = await Model.User.find({});
        res.json(users);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

module.exports = router;

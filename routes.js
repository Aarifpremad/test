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
let notification = require("./adminroutes/notification.router")
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
router.use("/" ,notification);
router.use("/admin", adminprofile);
router.use("/api" ,bank);
router.use("/api" ,apipool);

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

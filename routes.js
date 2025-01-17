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


// Define adminroutes
router.use("/api",userRouter.userRouter)
router.use("/",userRouter.setting)
router.use("/", adminRouter);
router.use("/", adminPageRouter);
router.use("/", botsRouter);
router.use("/", supportRouter);
router.use("/", tournament);
router.use("/", poll);
router.use("/", bank);

// You can add more adminroutes here if needed

module.exports = router;

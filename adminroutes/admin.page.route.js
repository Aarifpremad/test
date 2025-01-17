let express = require("express")
let router = express.Router();

let Model = require("../models/model");
// let authenticateSessionadmin = require("../service/auth").authenticateSessionadmin;
// router.use(authenticateSessionadmin)
router.route("/admin").get((req, res) => {
    res.render("index", { title: "Dashboard", page: "dashboard" });
});

router.route("/userlist").get((req, res) => {
    res.render("userlist", { title: "User Management", page: "users" });
});

router.route("/paymenthistory").get((req, res) => {
    res.render("payment", { title: "Payment History", page: "payment" });
});

router.route("/speenwheel").get((req,res)=>{
    res.render("speenwheel",{title :"spin Wheel",page:"spin"})
})

router.get('/users/details/:id', async (req, res) => {
    const { id } = req.params;
    let user = await Model.User.findById(id)
    if (!user) {
        return res.status(404).send('User not found');
    }
    user.id = id
    res.render('userDetails', { user });
});


router.get('/management', async (req, res) => {
    let managementSettings = await Model.Management.findOne()
    res.render('management', {
        title: 'Management',
        settings: managementSettings,
    });
});

router.get('/admin/support', (req, res) => {
    res.render('supportAdmin', { pageTitle: 'Admin Support', page: 'support' });
});



router.get('/content-notification', (req, res) => {
    res.render('content-notification', { title: "Content Notification", page: "content-notification" });
});

router.route("/notification").get((req, res) => {
    res.render('notification', { title: "Notification", page: "notification" });
});


router.get('/betting-orders', (req, res) => {
    res.render('bettingOrders', { title: 'Betting Orders', page: 'bettingOrders' });
});

router.get('/rooms-history', (req, res) => {
    res.render('roomsHistory', { title: 'Rooms/Games History', page: 'roomsHistory' });
});
router.get('/boot', (req, res) => {
    res.render('boot', { title: 'Rooms/Games History', page: 'roomsHistory' });
});

router.get('/botlist', (req, res) => {
    res.render('botslist', { title: 'Rooms/Games History', page: 'roomsHistory' });
});

router.get('/tournament', (req, res) => {
    res.render('tournament', { title: 'tournament', page: 'tournament' });
});
router.get('/pool', (req, res) => {
    res.render('pool', { title: 'pool', page: 'pool' });
});
router.get('/tournament/list', (req, res) => {
    res.render('tournamentlist', { title: 'tournamentlist', page: 'tournamentlist' });
});
router.get('/poll/list', (req, res) => {
    res.render('poollist', { title: 'poollist', page: 'poollist' });
});

module.exports = router;

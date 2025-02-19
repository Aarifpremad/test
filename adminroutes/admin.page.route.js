let express = require("express")
let router = express.Router();

let Model = require("../models/model");
let authenticateSessionadmin = require("../service/auth").authenticateSessionadmin;
router.route("/admin").get(authenticateSessionadmin,(req, res) => {
    res.render("index", { title: "Dashboard", page: "dashboard" });
});

router.route("/userlist").get(authenticateSessionadmin,(req, res) => {
    res.render("userlist", { title: "User Management", page: "users" });
});

router.route("/paymenthistory").get((req, res) => {
    res.render("payment", { title: "Payment History", page: "payment" });
});

router.route("/speenwheel").get((req,res)=>{
    res.render("speenwheel",{title :"spin Wheel",page:"spin"})
})

router.get('/users/details/:id',authenticateSessionadmin, async (req, res) => {
    const { id } = req.params;
    let user = await Model.User.findById(id)
    if (!user) {
        return res.status(404).send('User not found');
    }
    user.id = id
    res.render('userDetails', { user });
});


router.get('/management',authenticateSessionadmin, async (req, res) => {
    let managementSettings = await Model.Management.findOne()
    res.render('management', {
        title: 'Management',
        settings: managementSettings,
    });
});

router.post('/api/management', async (req, res) => {
    const { commission, referral, bonus, rewards } = req.body;
    if (!commission || !referral || !bonus || !rewards) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    let managementSettings = await Model.Management.findOne()
    managementSettings.commission =  parseFloat(commission)
    managementSettings.referral =  parseFloat(referral)
    managementSettings.bonus    = parseFloat(bonus)
    managementSettings.rewards  = parseFloat(rewards)
    await managementSettings.save();

    console.log('Updated Management Settings:', managementSettings);

    res.status(200).json({ success: true, settings: managementSettings });
});

router.get('/admin/support',authenticateSessionadmin, (req, res) => {
    res.render('supportAdmin', { pageTitle: 'Admin Support', page: 'support' });
});



router.get('/content-notification',authenticateSessionadmin, (req, res) => {
    res.render('content-notification', { title: "Content Notification", page: "content-notification" });
});

router.route("/notification").get(authenticateSessionadmin,(req, res) => {
    res.render('notification', { title: "Notification", page: "notification" });
});


router.get('/betting-orders',authenticateSessionadmin, (req, res) => {
    res.render('bettingOrders', { title: 'Betting Orders', page: 'bettingOrders' });
});

router.get('/rooms-history',authenticateSessionadmin, (req, res) => {
    res.render('roomsHistory', { title: 'Rooms/Games History', page: 'roomsHistory' });
});
router.get('/boot',authenticateSessionadmin, (req, res) => {
    res.render('boot', { title: 'Rooms/Games History', page: 'roomsHistory' });
});

router.get('/botlist',authenticateSessionadmin, (req, res) => {
    res.render('botslist', { title: 'Rooms/Games History', page: 'roomsHistory' });
});

router.get('/tournament',authenticateSessionadmin, (req, res) => {
    res.render('tournament', { title: 'tournament', page: 'tournament' });
});
router.get('/pool',authenticateSessionadmin, (req, res) => {
    console.log("yaya")
    res.render('pool', { title: 'pool', page: 'pool' });
});
router.get('/tournament/list',authenticateSessionadmin, (req, res) => {
    res.render('tournamentlist', { title: 'tournamentlist', page: 'tournamentlist' });
});
router.get('/poll/list',authenticateSessionadmin, (req, res) => {
    res.render('poollist', { title: 'poollist', page: 'poollist' });
});
router.get('/adminprofile',authenticateSessionadmin, (req, res) => {
    res.render('profile', { title: 'profile', page: 'profile' });
});

module.exports = router;

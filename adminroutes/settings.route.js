let express = require("express")
let router = express.Router();
let Model = require("../models/model");
const moment = require('moment'); 

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



module.exports = router;

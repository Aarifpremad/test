let express = require("express")
let router = express.Router();
let Model = require("../models/model");
const moment = require('moment'); 

const { createBot , fetchBots, getsinglebot, updatedBot, deleteBot} = require('../controller/boots.controoler');
;
const upload = require('../service/imageupload');

router.post('/api/bots/create', checkBotExists , upload.single('profilePic'), createBot);
router.get('/api/bots', fetchBots);
router.get('/api/bots/:botId',  getsinglebot);
router.put('/api/bots/:botId',upload.single('avatar'),  updatedBot);
router.delete('/api/bots/:botId',  deleteBot);

// create middelware
function checkBotExists(req, res, next) {
    
    console.log(req.body,'Checking if bot exists');
        next();

}
module.exports = router;

let express = require("express");
let Router = express.Router();
let authenticate = require("../service/auth")

let settingcontroler = require("../controller/setting.controller")

Router.post('/spin/setsettings',  settingcontroler.setSpinSettings); // Admin: Set spin settings
Router.get('/spin/settings',  settingcontroler.getSpinSettings); // Get spin settings
Router.post('/spin/userspin', authenticate , settingcontroler.spinWheel); // User: Spin the wheel



module.exports = Router;    


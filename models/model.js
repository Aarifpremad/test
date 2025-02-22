let Db = require("./db")

let User = require("./user.model")

let OTP = require("./otp.model");

let Enquiry = require("./enquiry.model")

let Spin = require("./spin.model")

let Transaction = require("./transaction.model")

let Management = require("./management.model")

let Content = require("./content.model")

let Order = require("./order.model");

let Room = require("./room.model");

let Bot = require("./bot.model");

let Tournament = require("./tournament.model");

let Poll = require("./poll.model");

let Admin = require("./admin.model")

let Notification = require("./notification.model");

let UserNotification = require("./user.notification.model")


module.exports = { User, OTP ,Enquiry ,Spin, Transaction  ,Management , Content  , Order , Room,Bot,Tournament , Poll ,Admin,Notification,UserNotification};

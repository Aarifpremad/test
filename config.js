let dotenv = require("dotenv").config()

let port = process.env.PORT || 4000
let db = process.env.DB
module.exports = {
     port :port,
     db : db
}

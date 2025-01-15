const mongoose = require('mongoose');

const notifactionschema = new mongoose.Schema({
    type: { type: String, }, 
    message: { type: String, },
    status: { type: Date, },
    rewards: { type: Date, },
}, { timestamps: true });

const NOTIFICATION = mongoose.model('notifaction', notifactionschema);

module.exports = NOTIFICATION;
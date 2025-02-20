const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: String,
    message: String,
    iconUrl: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: { type: String, required: true },
    mobileno: { type: String, required: true },
    expireTime: { type: Date, required: true },
    lastSentTime: { type: Date, required: true },
    hitCount: { type: Number, default: 0 } // Tracks hits within 1 minute
}, { timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP
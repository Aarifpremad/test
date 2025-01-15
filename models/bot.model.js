const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
    username: { type: String, required: true },
    nickname: { type: String },
    mobileno: { type: String, required: true, unique: true },
    refercode: { type: String },
    balance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    referbonus: { type: Number, default: 0 },
    email: { type: String, unique: true, sparse: true },
    status: { type: Boolean, default: true },
    dob: { type: Date },
    avatar: { type: Number, default: 1 },
    profilePic: { type: String, default: '' },
    numericid: { type: Number, unique: true, default: 100000 },
}, { timestamps: true });

const Bot = mongoose.model('Bot', botSchema);

module.exports = Bot;

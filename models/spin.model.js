const mongoose = require('mongoose');

const spinSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    percentage: { type: Number, required: true },
}, { timestamps: true });

const Spin = mongoose.model('Spin', spinSchema);

module.exports = Spin;

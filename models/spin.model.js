const mongoose = require('mongoose');

const spinSchema = new mongoose.Schema({
    title : { type: String, default: 'Spin' },
    amount: { type: Number, default: 0 },
}, { timestamps: true });

const Spin = mongoose.model('Spin', spinSchema);

module.exports = Spin;

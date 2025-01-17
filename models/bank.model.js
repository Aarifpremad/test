const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    // enum: ['Savings', 'Current'],
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bank', bankSchema);

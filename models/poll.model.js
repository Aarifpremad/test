const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  pollName: {
    type: String,
    required: true,
  },
  pollDescription: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  pollStatus: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  pollType: {
    type: Number,
    enum: [2, 4], // 2 Players or 4 Players
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  entryFee: {
    type: Number,
    required: true,
  },
  prizeType: {
    type: String,
    enum: ['automatic', 'manual'],
    required: true,
  },
  prizeAmount: {
    type: Number,
    required: function () {
      return this.prizeType === 'manual'; // Only required if prizeType is 'manual'
    },
  },
  waitTime: {
    type: Number,
    required: true,
  },
  gameDuration: {
    type: Number,
    required: true,
  },
  poolid: { 
    type: String, unique: true, required: true,
  },
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;

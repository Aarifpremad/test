const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  rank: {
    type: Number,
    required: true,
  },
  prizeType: {
    type: String,
    enum: ['amount', 'gift'],
    required: true,
  },
  prizeValue: {
    type: String,
    required: true,
  },
});

const tournamentSchema = new mongoose.Schema({
  tournamentName: {
    type: String,
    required: true,
  },
  tournamentDescription: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  gameMode: {
    type: String,
    // enum: ['cllasic', 'multiplayer'],
    default: 'cllasic',
  },
  entryFee: {
    type: Number,
    required: true,
  },
  maxUsers: {
    type: Number,
    required: true,
  },
  minRoomSize: {
    type: Number,
    required: true,
  },
  maxRoomSize: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  prizes: [prizeSchema], // List of prizes for rank distribution
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft',
  },
  tournamentid: { 
    type: String, unique: true, required: true,
  },
  iscompleted:{
    type:Boolean,
    default : false
  },
  
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;

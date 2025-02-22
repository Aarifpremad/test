const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ID reference
  username: { type: String }, // Naam
  avatar: { type: String, default: "" }, // Avatar image
  rank: { type: Number, default: null }, // Game end hone par rank
  score: { type: Number, default: 0 }, // Score track karne ke liye
  betamount: { type: Number, required: true }, // Individual bet amount
});

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true }, // Unique room ID
    gameType: { type: String, enum: ["ludo", "tournament"], required: true }, // Game type
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Sabhi participants
    players: [playerSchema], // Players ka array
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Winner ID
    totalBetAmount: { type: Number, default: 0 }, // Total bet amount of room
    status: {
      type: String,
      enum: ["waiting", "active", "completed", "cancelled"],
      default: "waiting",
    }, // Room status
    timeduration: { type: Number, default: 60 }, // Game duration
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", default: null } // Tournament ID reference
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;



// {
//   "roomId": "LUDO1234",
//   "gameType": "ludo",
//   "participants": [
//     "65d382b8c9a9f2b6a1a5c789",
//     "65d382b8c9a9f2b6a1a5c790",
//     "65d382b8c9a9f2b6a1a5c791",
//     "65d382b8c9a9f2b6a1a5c792"
//   ],
//   "players": [
//     {
//       "userId": "65d382b8c9a9f2b6a1a5c789",
//       "username": "Player1",
//       "avatar": "https://example.com/avatar1.png",
//       "rank": 1,
//       "score": 23,
//       "betAmount": 50
//     },
//     {
//       "userId": "65d382b8c9a9f2b6a1a5c790",
//       "username": "Player2",
//       "avatar": "https://example.com/avatar2.png",
//       "rank": 2,
//       "score": 18,
//       "betAmount": 50
//     },
//     {
//       "userId": "65d382b8c9a9f2b6a1a5c791",
//       "username": "Player3",
//       "avatar": "https://example.com/avatar3.png",
//       "rank": 3,
//       "score": 12,
//       "betAmount": 50
//     },
//     {
//       "userId": "65d382b8c9a9f2b6a1a5c792",
//       "username": "Player4",
//       "avatar": "https://example.com/avatar4.png",
//       "rank": 4,
//       "score": 7,
//       "betAmount": 50
//     }
//   ],
//   "winner": "65d382b8c9a9f2b6a1a5c789",
//   "totalBetAmount": 200,
//   "status": "completed",
//   "timeduration": 300
// }

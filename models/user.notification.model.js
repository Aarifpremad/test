const mongoose = require("mongoose");

const UserNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  iconUrl: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const UserNotification = mongoose.model("UserNotification", UserNotificationSchema);
module.exports = UserNotification;
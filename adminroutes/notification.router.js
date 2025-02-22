let express = require("express");
let router = express.Router();
let Model = require("../models/model") 
const admin = require("firebase-admin");
const fs = require("fs");
const upload = require('../service/imageupload'); // Multer middleware for file upload

router.post("/send-notification",upload.single('icon'), async (req, res) => {
    try {
  const { tokens, title, message, iconUrl } = req.body;
  let createnot = {
    title, message,
    iconUrl: `/uploads/${req.file.filename}`,
  }
  const newNotification = new Model.Notification(createnot);
  await newNotification.save();

  if (!tokens || !title || !message) {
    return res.status(400).json({ error: "Missing required fields (tokens, title, or message)" });
  }

    await sendNotification(tokens, title, message, iconUrl);
    res.json({ success: true, message: "Notification sent successfully" });

    const users = await Model.User.find({ fcmtoken: { $in: tokens } }, "_id fcmtoken");
  if (!users.length) {
    // return res.status(400).json({ error: "No users found for given tokens" });
    return;
  }

  const notifications = users.map((user) => ({
    userId: user._id,
    title,
    message,
    iconUrl:`/uploads/${req.file.filename}`,
  }));
  await Model.UserNotification.insertMany(notifications);
  
    res.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

router.post("/send-bulk-notification", async (req, res) => {
  const { tokens, title, body } = req.body;
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    await sendBulkNotification(tokens, title, body);
    res.json({ success: true, message: "Bulk notification sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send bulk notification" });
  }
});

router.get('/get-notifications', async (req, res) => {
    try {
        const notifications = await Model.Notification.find().sort({ createdAt: -1 });
        res.json({ data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/delete-notification/:id', async (req, res) => {
    try {
        await Model.Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notification deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/delete-all-notifications', async (req, res) => {
    try {
        await Model.Notification.deleteMany({});
        res.json({ success: true, message: 'All notifications deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

const serviceAccount = require("../serviceAccountKey.json"); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const sendNotification = async (tokens, title, body, iconUrl) => {
  const message = {
    notification: {
      title: title,
      body: body,
      image: iconUrl, // Include the iconUrl if it's provided
    },
    tokens: tokens, // Supports sending to multiple tokens
  };

  try {
    // Use sendAll for sending notifications to multiple tokens
    const response = await admin.messaging().sendAll(message.tokens.map(token => ({
      ...message,
      token
    })));

    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const sendBulkNotification = async (tokens, title, body) => {
  const message = {
    notification: { title, body },
    tokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log("Bulk notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending bulk notification:", error);
  }
};



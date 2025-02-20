let express = require("express");
let router = express.Router();
let Model = require("../models/model") 

const { sendNotification, sendBulkNotification } = require("../firebase"); // Import notification functions


router.post("/send-notification", async (req, res) => {
  const { tokens, title, message, iconUrl } = req.body;

  const newNotification = new Model.Notification({ title, message, iconUrl });
  await newNotification.save();

  if (!tokens || !title || !message) {
    return res.status(400).json({ error: "Missing required fields (tokens, title, or message)" });
  }

  try {
    await sendNotification(tokens, title, message, iconUrl);
    res.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Send notification to multiple users
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

// Delete a Single Notification
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

const admin = require("firebase-admin");
const fs = require("fs");

// Load Firebase service account key
const serviceAccount = require("./serviceAccountKey.json"); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send notifications
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

// Export notification functions
module.exports = { sendNotification, sendBulkNotification };

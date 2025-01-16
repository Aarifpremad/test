const express = require('express');
const router = express.Router();
const multer = require('multer');
const Poll = require('../models/poll.model'); // Import the Poll model
const upload = require('../service/imageupload'); // Multer middleware for file upload

router.post('/api/create-poll', upload.single('thumbnail'), async (req, res) => {
  try {
    const {
      pollName,
      pollDescription,
      startTime,
      pollStatus,
      pollType,
      entryFee,
      prizeType,
      prizeAmount,
      waitTime,
      gameDuration,
    } = req.body;

    // Validate thumbnail upload
    if (!req.file) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    const thumbnailPath = `/uploads/${req.file.filename}`;

    // Validate startTime
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ message: 'Invalid start time' });
    }

    // Create the new poll
    const newPoll = new Poll({
      pollName,
      pollDescription,
      startTime: startDate,
      pollStatus,
      pollType,
      entryFee,
      prizeType,
      prizeAmount,
      waitTime,
      gameDuration,
      thumbnail: thumbnailPath,
    });

    await newPoll.save();
    res.status(201).json({ message: 'Poll created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the poll.' });
  }
});

module.exports = router;

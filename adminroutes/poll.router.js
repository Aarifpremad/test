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


// Route to fetch the poll list with filters
router.get('/api/poll-list', async (req, res) => {
    try {
      const { startDate, endDate, search, limit = 10, page = 1 } = req.query;
  
      // Initialize filters object
      const filters = {};
  
      // Convert startDate and endDate to Date objects for comparison
      if (startDate) {
        const start = new Date(startDate);
        // Ensure startDate is valid
        if (!isNaN(start.getTime())) {
          filters.startTime = { $gte: start }; // greater than or equal to startDate
        }
      }
  
      if (endDate) {
        const end = new Date(endDate);
        // Ensure endDate is valid
        if (!isNaN(end.getTime())) {
          // If there's already a startTime filter, we combine the filters to ensure the range is correct
          if (filters.startTime) {
            filters.startTime.$lte = end; // less than or equal to endDate
          } else {
            filters.startTime = { $lte: end }; // only endDate if startDate is not present
          }
        }
      }
  
      if (search) {
        filters.pollName = { $regex: search.value, $options: 'i' }; // Case-insensitive search
      }
  
      // Calculate pagination
      const skip = (page - 1) * limit;
      const pollList = await Poll.find(filters).skip(skip).limit(parseInt(limit));
  
      // Get total count of records for pagination
      const totalRecords = await Poll.countDocuments(filters);
  
      res.json({
        draw: parseInt(req.query.draw || 1),
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: pollList,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching polls.' });
    }
  });
  
  
  

module.exports = router;

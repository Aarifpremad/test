const express = require('express');
const router = express.Router();
const Tournament = require('../models/tournament.model');
let poll = require("../models/poll.model")
const upload = require('../service/imageupload'); // Multer middleware for file upload
const { json } = require('body-parser');



  router.get('/tournaments', async (req, res) => {
    try {
      
  
      const tournaments = await Tournament.find()
  
      res.json({
        data: tournaments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch tournaments', error });
    }
  });

  
  router.get('/pools', async (req, res) => {
    try {
      
      console.log("ua")
      const pool = await poll.find()
  
      res.send(pool)
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch tournaments', error });
    }
  });
  
  

module.exports = router;

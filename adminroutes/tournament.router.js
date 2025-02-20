const express = require('express');
const router = express.Router();
const Tournament = require('../models/tournament.model');
const upload = require('../service/imageupload'); // Multer middleware for file upload
const { json } = require('body-parser');

const isValidDate = (date) => {
    const parsedDate = new Date(date);
    console.log(parsedDate);
    return !isNaN(parsedDate); // Returns true if valid
  };
  
  router.post('/api/create-tournament', upload.single('thumbnail'), async (req, res) => {
    try {
      console.log(req.body)
      const {
        tournamentName,
        tournamentDescription,
        startDate,
        endDate,
        startTime,
        endTime,
        gameMode,
        entryFee,
        maxUsers,
        minRoomSize,
        maxRoomSize,
        rank,
        prizeType,
        prizeValue,
      } = req.body;
  
      // Validate thumbnail upload
      if (!req.file) {
        return res.status(400).json({ message: 'Thumbnail is required' });
      }
  
  
      // Validate rank, prizeType, and prizeValue consistency
      if (!Array.isArray(rank) || !Array.isArray(prizeType) || !Array.isArray(prizeValue)) {
        return res.status(400).json({ message: 'Rank, prizeType, and prizeValue must be arrays' });
      }
      if (rank.length !== prizeType.length || rank.length !== prizeValue.length) {
        return res.status(400).json({ message: 'Inconsistent prize data: all arrays must have the same length' });
      }
  
      // Construct prize data
      const prizes = rank.map((r, i) => ({
        rank: parseInt(r),
        prizeType: prizeType[i],
        prizeValue: parseFloat(prizeValue[i]),
      }));
  
      // Create and save the tournament
      const newTournament = new Tournament({
        tournamentName,
        tournamentDescription,
        startDate: startDate,
        endDate: endDate,
        startTime: startDate,
        endTime: endDate,
        gameMode,
        entryFee: parseFloat(entryFee),
        maxUsers: parseInt(maxUsers),
        minRoomSize: parseInt(minRoomSize),
        maxRoomSize: parseInt(maxRoomSize),
        thumbnail: `/uploads/${req.file.filename}`,
        prizes,
        tournamentid: `T-${Date.now()}`
      });
  
      await newTournament.save();
      res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating tournament', error: error.message });
    }
  });



  router.get('/api/tournament-list', async (req, res) => {
    try {
      const { start = 0, length = 10, search = '', order = [], startDate, endDate } = req.query;
  
      const query = {};
  
      // Search by tournament name
      if (search) {
        query.tournamentName = { $regex: new RegExp(search.value, 'i') };
      }
  
      // Filter by start and end date
      if (startDate && endDate) {
        query.startDate = { $gte: new Date(startDate) };
        query.endDate = { $lte: new Date(endDate) };
      }
  
      const sort = order.length
        ? { [order[0].column]: order[0].dir === 'asc' ? 1 : -1 }
        : { createdAt: -1 };
  
      const totalRecords = await Tournament.countDocuments(query);
      const tournaments = await Tournament.find(query)
        .sort(sort)
        .skip(parseInt(start))
        .limit(parseInt(length));
  
      res.json({
        draw: req.query.draw || 1,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: tournaments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch tournaments', error });
    }
  });
  

  router.get('/api/tournament-rooms/:tournamentId', async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { start = 0, length = 10, search = '', order = [] } = req.query;

      const tournament = await Tournament.findById(tournamentId);

      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      // Assuming rooms are part of the tournament document
      let rooms = tournament.rooms || [];

      // Search by room name or other criteria
      if (search) {
        rooms = rooms.filter(room => room.name.toLowerCase().includes(search.value.toLowerCase()));
      }

      // Sort rooms
      if (order.length) {
        const sortField = order[0].column;
        const sortOrder = order[0].dir === 'asc' ? 1 : -1;
        rooms = rooms.sort((a, b) => (a[sortField] > b[sortField] ? sortOrder : -sortOrder));
      }

      const totalRecords = rooms.length;
      const paginatedRooms = rooms.slice(parseInt(start), parseInt(start) + parseInt(length));

      res.json({
        draw: req.query.draw || 1,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: paginatedRooms,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch tournament rooms', error });
    }
  });

module.exports = router;

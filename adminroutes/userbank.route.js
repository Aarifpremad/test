const express = require('express');
const router = express.Router();
const Bank = require('../models/bank.model');
let authenticate = require("../service/auth").authenticateToken;
// Create bank details
router.post('/bank-details', authenticate, async (req, res) => {
  try {
    console.log("call this ")
    const { name, accountNumber, ifscCode, bankName, accountType } = req.body;

    // Validate required fields
    if (!name || !accountNumber || !ifscCode || !bankName || !accountType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userId = req.user.id;

    // Check if account number already exists for another user
    const existingAccount = await Bank.findOne({ accountNumber, userId: { $ne: userId } });
    if (existingAccount) {
      return res.status(400).json({ status: false, message: 'Account number already exists for another user' });
    }

    // Check if the user already has bank details
    const existingBankDetails = await Bank.findOne({ userId });

    if (existingBankDetails) {
      // Update existing bank details
      existingBankDetails.name = name;
      existingBankDetails.accountNumber = accountNumber;
      existingBankDetails.ifscCode = ifscCode;
      existingBankDetails.bankName = bankName;
      existingBankDetails.accountType = accountType;

      await existingBankDetails.save();
      return res.status(200).json({ message: 'Bank details updated successfully', bankDetails: existingBankDetails });
    }

    // Create and save new bank details if not already present
    const bankDetails = new Bank({
      userId,
      name,
      accountNumber,
      ifscCode,
      bankName,
      accountType,
    });

    await bankDetails.save();
    res.status(201).json({ message: 'Bank details added successfully', bankDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing bank details' });
  }
});



// Fetch bank details by userId
router.get('/bank-details',authenticate, async (req, res) => {
    try {
      // const { userId } = req.params;
      let userId = req.user.id;
      const bankDetails = await Bank.find({ userId });
      if (!bankDetails || bankDetails.length === 0) {
        return res.status(404).json({ message: 'No bank details found for this user' });
      }
  
      res.status(200).json({ message: 'Bank details fetched successfully', bankDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching bank details' });
    }
  });

router.delete('/bank-details',authenticate, async (req, res) => {
    try {
      const  userId  = req.user.id;
  
      // Find and delete the bank details
      const deletedBankDetails = await Bank.findOneAndDelete({  userId });
      if (!deletedBankDetails) {
        return res.status(404).json({ message: 'Bank details not found' });
      }
  
      res.status(200).json({ message: 'Bank details deleted successfully', deletedBankDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while deleting bank details' });
    }
  });
  
  module.exports = router;


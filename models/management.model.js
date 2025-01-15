const mongoose = require('mongoose');

// Define the schema for management settings
const managementSchema = new mongoose.Schema({
    commission: { type: Number, required: true }, // Percentage
    referral: { type: Number, required: true },   // Percentage
    bonus: { type: Number, required: true },      // Numeric value
    rewards: { type: Number, required: true },    // Numeric value
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

// Create the model
const Management = mongoose.model('Management', managementSchema);

module.exports = Management;

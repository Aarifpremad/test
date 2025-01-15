const mongoose = require('mongoose');

// Define the schema for content
const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        unique: true, 
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { timestamps: true }); 

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;

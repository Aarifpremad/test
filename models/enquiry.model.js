const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileno: { type: String, required: true },
    email: { type: String,  },
    state: { type: String },
    city: { type: String },
    description: { type: String, required: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;

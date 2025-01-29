const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileno: { type: String, required: true },
    email: { type: String, default: '' },
    state: { type: String ,default: '' },
    city: { type: String , default: ''},
    description: { type: String, required: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status :{ type: String, default: 'Pending' },
    srno: { type: String, default: '' },
}, { timestamps: true });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;

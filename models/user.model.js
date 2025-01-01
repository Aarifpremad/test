const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    nickname: { type: String },
    mobileno: { type: String, required: true },
    refercode: { type: String, unique: true },
    balance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    referbonus: { type: Number, default: 0 },
    refercommission: { type: Number, default: 0 },
    email: { type: String, unique: true, default: "" },
    dob: { type: String, default: "" },
    state: { type: String },
    city: { type: String },
    numericid: { type: Number, unique: true, default: 100000 },
    profilePic: { type: String, default: '' },
    avatar: { type: Number, min: 1, max: 20, default: 1 },
    refuser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    token: { type: String },
    notification : {type : Boolean ,default :true}
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
    const payload = { id: this._id, mobileno: this.mobileno };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

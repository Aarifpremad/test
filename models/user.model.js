const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: { type: String,  },
    nickname: { type: String },
    mobileno: { type: String,  },
    refercode: { type: String, unique: true },
    balance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    referbonus: { type: Number, default: 0 },
    refercommission: { type: Number, default: 0 },
    email: { type: String, default: "" },
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
    notification : {type : Boolean ,default :true},
    image:{type: String, default: '' },
    fcmtoken:{type: String, default: '' },
    status : { type: String, default: "Active" },
    walletFrozen : { type: Boolean, default: false },
    spincount: { type: Number, default: 10 },
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
    const payload = { id: this._id, mobileno: this.mobileno , numericid: this.numericid,avatar:this.avatar,balance:this.balance ,username :this.username,nickname :this.nickname};
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

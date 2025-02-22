const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { 
        type: Number, 
        required: true, 
        unique: true 
    }, // New field for numeric ID
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    type: { 
        type: String, 
        enum: ['game', 'spin', 'withdraw', 'deposit', 'referral'], 
        required: true 
    }, 
    txntype :{
        type: String, 
        enum: ['debit', 'credit'], 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    currentbalance :{
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'success' 
    }, 
    details: { 
        type: Object, 
        default: {} 
    }, 
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    note:{
        type: String,
        default: ""
    },
    roomid:{
        type: String,
        default: ""
    }
}, { timestamps: true });

transactionSchema.pre('save', async function (next) {
    if (this.isNew) {
        console.log("yaya")
        try {
            const lastTransaction = await this.constructor.findOne().sort('-transactionId');
            this.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

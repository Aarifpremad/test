let Model = require("../models/model")


const userTransactions = async (req, res) => {
    try {
        const  userId  = req.user._id; 
        const { type } = req.query; 

        let filter = { userId }; 

        if (type) {
            if (type === 'bonus') {
                filter = {
                    userId,
                    $or: [
                        { type: 'bonus' },
                        { type: 'spin' },
                        { type: 'referral' }
                    ]
                };
            } else {
                filter.type = type; 
            }
        }

        let transactions = await Model.Transaction.find(filter).sort({ createdAt: -1 }); 

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found.' });
        }

        res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const deposit = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user._id; 

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid deposit amount' });
        }

        const user = await Model.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.balance += amount;
        await user.save();

        const transaction = new Model.Transaction({
            userId,
            type: 'deposit',  
            amount,         
            currentbalance: user.balance, 
            details: {
                description: 'Deposit made by user'
            }
        });

        await transaction.save(); 

        res.status(200).json({
            message: 'Deposit successful',
            transaction,
            balance: user.balance 
        });
    } catch (error) {
        console.error('Error during deposit:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const credit = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user._id; 

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid credit amount' });
        }

        const user = await Model.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.balance += amount;
        await user.save();

        const transaction = new Model.Transaction({
            userId,
            type: 'credit', 
            amount,          
            currentbalance: user.balance, 
            details: {
                description: description || 'Credit added to user account'
            }
        });

        await transaction.save();

        res.status(200).json({
            message: 'Credit successful',
            transaction,
            balance: user.balance 
        });
    } catch (error) {
        console.error('Error during credit:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};




module.exports = { userTransactions ,credit ,deposit};
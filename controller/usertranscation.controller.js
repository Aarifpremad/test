let Model = require("../models/model")
let models = require("../models/model")
let mongoose = require("mongoose")

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
        let { amount } = req.body;
        amount = parseInt(amount);  
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
            userId: user._id,
            type: 'deposit',
            amount: amount,
            currentbalance: user.balance,
            status: 'success',
            note: 'Wallet credited successfully ',
            details : {
                description: 'Deposit made by user'
            },
        });
        const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
        transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
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


const withdraw = async (req, res) => {
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

        user.balance -= amount;
        await user.save();

        const transaction = new Model.Transaction({
            userId: user._id,
            type: 'withdraw',
            amount: amount,
            currentbalance: user.balance,
            status: 'success',
            note: 'Wallet deduct successfully ',
            details : {
                description: 'withdraw made by user'
            },
        });
        const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
        transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
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

const transactionlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const { search, limit, page, orderColumn, orderDir } = req.query;

        // Parse pagination parameters
        const limitValue = parseInt(limit) || 10;
        const pageValue = parseInt(page) || 1;
        const skip = (pageValue - 1) * limitValue;

        // Parse and validate `userId`
        const objectId =new mongoose.Types.ObjectId(userId);

        // Build search filter
        const searchFilter = search
            ? {
                  $or: [
                      { type: { $regex: search, $options: 'i' } },
                      { status: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

            const query = { userId: userId, ...searchFilter };

        const columns = ['type', 'amount', 'currentbalance', 'status', 'createdAt'];
        const sortOptions = {};

        if (orderColumn && columns[orderColumn]) {
            sortOptions[columns[orderColumn]] = orderDir === 'asc' ? 1 : -1;
        } else {
            sortOptions['createdAt'] = -1; // Default sort by `createdAt` descending
        }

        const transactions = await models.Transaction.find(query)
        .sort({ createdAt: -1 }) 
        .skip(skip)
            .limit(limitValue);

        const totalCount = await models.Transaction.countDocuments({ userId: objectId });
        const filteredCount = await models.Transaction.countDocuments(query);

        res.json({
            transactions,
            totalRecords: totalCount,
            filteredRecords: filteredCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }


}

const transactionbyuser = async (req, res) => {
    try {
        console.log("Fetching transactions...");
        const { search, type, userId, limit, page, orderColumn, orderDir } = req.query;

        // Pagination setup
        const limitValue = parseInt(limit) || 10;
        const pageValue = parseInt(page) || 1;
        const skip = (pageValue - 1) * limitValue;

        // Build the query
        const query = {};

        if (search) {
            query.$or = [
                { type: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
            ];
        }
        if (type) query.type = type;
        if (userId) {
            const userIdNumber = Number(userId);
            if (isNaN(userIdNumber)) {
                return res.status(400).json({ message: 'Invalid userId' });
            }
            const user = await models.User.findOne({ numericid: userIdNumber }).select('_id').lean();
            query.userId = user._id
        }

        const columns = ['type', 'amount', 'currentbalance', 'status', 'createdAt'];
        const sortOptions = {};
        sortOptions[columns.includes(orderColumn) ? orderColumn : 'createdAt'] = orderDir === 'asc' ? 1 : -1;

        // Execute both queries in parallel for better performance
        const [transactions, filteredCount, totalCount] = await Promise.all([
            models.Transaction.find(query)
                .populate('userId', 'username email numericid')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitValue)
                .lean(), // Convert to plain JS objects for faster response

            models.Transaction.countDocuments(query),
            models.Transaction.estimatedDocumentCount() // Faster than countDocuments() for total records
        ]);

        res.json({
            transactions,
            totalRecords: totalCount,
            filteredRecords: filteredCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
};


module.exports = { userTransactions ,withdraw ,deposit,transactionlist,transactionbyuser};
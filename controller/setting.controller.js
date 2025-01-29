let Model = require("../models/model")

const cron = require('node-cron');


// Get all spin settings
const getSpinSettings = async (req, res) => {
    try {
        const spins = await Model.Spin.find();

        // Get the current date and time in UTC
        const now = new Date();

        // Adjust to IST (UTC + 5:30)
        const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
        const nowInIST = new Date(now.getTime() + IST_OFFSET);

        // Calculate the next midnight in IST
        const nextMidnight = new Date(nowInIST);
        nextMidnight.setDate(nowInIST.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);

        // Calculate the countdown in milliseconds
        const countdownMs = nextMidnight - nowInIST;

        // Convert the countdown to hours, minutes, and seconds
        const hours = Math.floor(countdownMs / (1000 * 60 * 60));
        const minutes = Math.floor((countdownMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((countdownMs % (1000 * 60)) / 1000);

        const countdown = {
            hours,
            minutes,
            seconds,
        };

        let spincount = req.user.spincount;

        res.status(200).json({ 
            message: 'Spin settings retrieved successfully', 
            spins,
            countdown, // Include the countdown in the response
            spincount
        });
    } catch (error) {
        console.error('Error fetching spin settings:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



const spinWheel = async (req, res) => {
    try {
        
        let winningAmount  = req.body.winningAmount; 
        let userId = req.user._id
        if(!winningAmount){
            return res.status(400).json({ message: 'Winning amount is required' });
        }
        console.log(userId ,winningAmount)
        const user = await Model.User.findById(userId);
        // console.log(user.balance , Number(winningAmount))
        user.balance += Number(winningAmount);
        user.spincount -= 1;
        await user.save();
        
        const transaction = new Model.Transaction({
            userId,
            type: 'spin',
            amount: winningAmount,
            currentbalance: user.balance, 
            details: {
                description: 'Spin Wheel Win'
            }
        });

        const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
        transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
        await transaction.save();



        // Respond with the winning amount
        res.status(200).json({ message: 'Spin successful!', winningAmount });
    } catch (error) {
        console.error('Error during spin:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

cron.schedule('0 0 * * *', 
    async () => {
        try {

            await Model.User.updateMany({}, { $set: { spincount: 10 } });
            console.log("Spin count successfully reset to 1 for all users at midnight IST.");
        } catch (error) {
            console.error("Error during spin count reset:", error);
        }
    },
    {
        timezone: "Asia/Kolkata", 
    }
);

module.exports = {  getSpinSettings, spinWheel };

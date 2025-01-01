let Model = require("../models/model")

lastSpins = [
    10, 20, 10, 50, 10, 20, 20, 50, 10, 10, 20, 50, 10, 10, 20, 50, 10, 20, 50, 50,
    10, 10, 20, 50, 10, 20, 50, 10, 20, 20, 50, 10, 10, 20, 50, 50, 10, 20, 50, 10,
    10, 20, 50, 10, 20, 50, 50, 10, 10, 20, 50, 50, 10, 20, 50, 10, 20, 20, 50, 10,
    10, 20, 50, 50, 10, 20, 50, 10, 10, 20, 50, 10, 20, 50, 50, 10, 10, 20, 50, 50,
    10, 20, 50, 10, 20, 20, 50, 10, 10, 20, 50, 50, 10, 20, 50, 10
];

// Create or update spin settings
const setSpinSettings = async (req, res) => {
    try {
        const { spins } = req.body; // Array of { amount, percentage }

        if (!spins || !Array.isArray(spins) || spins.length === 0) {
            return res.status(400).json({ message: 'Invalid input. Provide spin settings.' });
        }

        const totalPercentage = spins.reduce((sum, spin) => sum + spin.percentage, 0);
        if (totalPercentage > 100) {
            return res.status(400).json({ message: 'Total percentage must be 100.' });
        }

        // Clear existing settings
        await Model.Spin.deleteMany();

        // Save new settings
        await Model.Spin.insertMany(spins);

        res.status(200).json({ message: 'Spin settings updated successfully' });
    } catch (error) {
        console.error('Error setting spin settings:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get all spin settings
const getSpinSettings = async (req, res) => {
    try {
        const spins = await Model.Spin.find();

        res.status(200).json({ message: 'Spin settings retrieved successfully', spins });
    } catch (error) {
        console.error('Error fetching spin settings:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const spinWheel = async (req, res) => {
    try {
        const spins = await Model.Spin.find(); // Fetch spin configuration
        if (spins.length === 0) {
            return res.status(400).json({ message: 'Spin settings not configured yet.' });
        }

        // Total spins in history (up to 100)
        const totalSpins = lastSpins.length;

        // Calculate actual occurrences of each amount in the last 100 spins
        const actualFrequencies = {};
        lastSpins.forEach((amount) => {
            actualFrequencies[amount] = (actualFrequencies[amount] || 0) + 1;
        });

        // Calculate weighted probabilities for each amount
        const weightedAmounts = [];
        spins.forEach((spin) => {
            const expectedFrequency = (spin.percentage / 100) * totalSpins;
            const actualFrequency = actualFrequencies[spin.amount] || 0;

            // Add weight inversely proportional to actual frequency
            const weight = Math.max(1, expectedFrequency - actualFrequency);
            for (let i = 0; i < weight; i++) {
                weightedAmounts.push(spin.amount);
            }
        });

        // Randomly select a winning amount from the weighted pool
        const winningAmount = weightedAmounts[Math.floor(Math.random() * weightedAmounts.length)];

        // Update last spins (limit to last 100)
        lastSpins.push(winningAmount);
        if (lastSpins.length > 100) {
            lastSpins.shift(); // Remove the oldest spin
        }
        let userId = req.user._id
        const transaction = new Model.Transaction({
            userId,
            type: 'spin',
            amount: winningAmount,
            details: {
                spins: spins, // Include spin configuration IDs for reference
                description: 'Spin Wheel Win'
            }
        });

        await transaction.save();

        const user = await Model.User.findById(userId);
        user.balance += winningAmount;
        await user.save();

        // Respond with the winning amount
        res.status(200).json({ message: 'Spin successful!', winningAmount });
    } catch (error) {
        console.error('Error during spin:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { setSpinSettings, getSpinSettings, spinWheel };

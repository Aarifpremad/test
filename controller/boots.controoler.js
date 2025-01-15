let Model = require("../models/model")

// Create Bot
const createBot = async (req, res) => {
    try {
        const { 
            username, 
            nickname, 
            mobileno, 
            refercode, 
            balance = 0, 
            bonus = 0, 
            referbonus = 0, 
            email = '', 
            dob = '', 
            avatar = 1 
        } = req.body;
        console.log(req.body)
        // Validate required fields
        if (!username || !mobileno) {
            return res.status(400).json({ success: false, message: 'Username and Mobile No are required.' });
        }

        // Check if a bot with the same mobile number or email already exists
        const existingBot = await Model.Bot.findOne({ $or: [{ mobileno }, { email }] });
        if (existingBot) {
            return res.status(400).json({ success: false, message: 'Bot with this Mobile No or Email already exists.' });
        }

       const lastUser = await Model.Bot.findOne().sort({ numericid: -1 });
       const numericid = lastUser ? lastUser.numericid + 1 : 100000;
        // Create the bot object
        const newBot = new Model.Bot({
            username,
            nickname,
            mobileno,
            refercode,
            balance,
            bonus,
            referbonus,
            email,
            dob,
            avatar,
            profilePic: req.file ? `/uploads/${req.file.filename}` : '', // Save file path
            numericid:numericid,
        });

        // Save to database
        await newBot.save();

        return res.status(201).json({ success: true, message: 'Bot created successfully.', bot: newBot });
    } catch (error) {
        console.error('Error creating bot:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const fetchBots = async (req, res) => {
    try {
        const { search, botName, limit = 10, page = 1, orderColumn = 'createdAt', orderDir = 'desc' } = req.query;
        
        const query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } }, // Search by username
                { nickname: { $regex: search, $options: 'i' } }  // Optionally search by nickname
            ];
        } else if (botName) {
            query.username = { $regex: botName, $options: 'i' }; // Case-insensitive search by botName
        }
        const bots = await Model.Bot.find(query)
            .sort({ [orderColumn]: orderDir })  // Dynamic column sorting
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalRecords = await Model.Bot.countDocuments(query);
        const filteredRecords = bots.length;

        res.json({
            bots,
            totalRecords,
            filteredRecords,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getsinglebot = async (req, res) => {
    const { botId } = req.params;

    try {
        // Fetch bot details from the database
        const bot = await Model.Bot.findOne({ numericid: botId });

        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        res.status(200).json({
            bot: {
                username: bot.username,
                status: bot.status,
                avatar: bot.avatar, // Include avatar URL if stored
                createdAt: bot.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bot details', error });
    }
}
const updatedBot = async (req, res) => {
    const { botId } = req.params;
    const { username, status } = req.body; 
    const avatarFile = req.file;

    try {
        const bot = await Model.Bot.findOne({ numericid: botId });

        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }
        bot.username = username ;
        bot.status = status ;

        if (avatarFile) {
            bot.profilePic = `/uploads/${avatarFile.filename}`;
        }

        await bot.save();

        res.status(200).json({ message: 'Bot updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating bot', error });
    }
}
const deleteBot = async (req, res) => {
    const { botId } = req.params;
    
    try {
        const bot = await Model.Bot.findOneAndDelete({numericid:botId});
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }
        res.status(200).json({ message: 'Bot deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Failed to delete bot', error });
    }
}
module.exports = { createBot ,fetchBots, getsinglebot, updatedBot, deleteBot };

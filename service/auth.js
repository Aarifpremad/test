const jwt = require('jsonwebtoken');
const Model = require('../models/model'); // Adjust the path based on your folder structure

const authenticateToken = async (req, res, next) => {
    const token = req.header('token')?.split(' ')[1]; // Extract the token from the 'Authorization' header
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Model.User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isDeleted) return res.status(403).json({ message: 'Account is deactivated' });

        req.user = user; // Attach the user object to the request
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token', error: error.message });
    }
};

module.exports = authenticateToken;

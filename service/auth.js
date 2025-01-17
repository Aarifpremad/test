const jwt = require('jsonwebtoken');
const Model = require('../models/model'); // Adjust the path based on your folder structure

// main file to io import

const authenticateToken = async (req, res, next) => {
    const token = req.header('token'); // Extract the token from the 'Authorization' header
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

let socketauth = (socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        socket.emit('unauthorized', { message: 'Invalid token' });
        return;
      }
      socket.user = decoded;
      next();
    });
};


const authenticateSessionadmin = (req, res, next) => {
  if(!req.session){
    return res.redirect("/");
  }
  if (!req.session.admin) {
    return res.redirect("/"); 
  }
  res.locals.admin = req.session.admin; 
  next();
};


module.exports = {authenticateToken, socketauth , authenticateSessionadmin};

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin.model');


// Admin Login API
let adminlogin =  async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    console.log(email,password);
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check password
    const isPasswordMatch = await admin.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate and store JWT
    const token = await admin.generateAuthToken();
    console.log(req.session,"line27");
    req.session.admin = {
      id: admin._id,
      name: admin.name,
      role: admin.role,
    };
    console.log(req.session ,"line29")

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};

// email: 'admin@example.com',
// password: 'Admin@123', // Use a strong password in production

module.exports = {adminlogin};

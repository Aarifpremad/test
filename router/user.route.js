let express = require("express");
let Router = express.Router();

// Import controllers
// const { signUp, signIn, sendOtp, verifyOtp ,uploadProfileImage ,deleteAccount , getProfile ,updateProfile } = require("../controller/user.controller");
const UserController= require("../controller/user.controller");
let authenticate = require("../service/auth")
const transaction = require("../controller/usertranscation.controller")
// User routes
Router.post("/signup", UserController.signUp);
Router.post("/signin", UserController.signIn);
Router.post("/send-otp", UserController.sendOtp);
Router.post("/verify-otp", UserController.verifyOtp);
Router.get("/getProfile", authenticate , UserController.getProfile);
Router.post("/updateProfile",authenticate ,  UserController.updateProfile);

Router.post("/image",authenticate, UserController.uploadProfileImage);
Router.post("/deletaccount",authenticate,  UserController.deleteAccount);


Router.post('/add-enquiries', authenticate, UserController.createEnquiry); // Create enquiry
Router.get('/enquiries', authenticate, UserController.getEnquiries); // Get all enquiries
Router.post('/enquiries/:id', authenticate, UserController.deleteEnquiry); // Delete enquiry by ID


Router.get("/user/transaction",authenticate,  transaction.userTransactions);
Router.post("/user/transaction/credit",authenticate,  transaction.credit);
Router.post("/user/transaction/deposit",authenticate,  transaction.deposit);

module.exports = Router;


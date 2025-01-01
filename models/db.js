const  mongoose = require("mongoose");

let config = require("../config")
console.log(config.db)
mongoose.connect("mongodb://localhost:27017/scorebnavo").then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });
const  mongoose = require("mongoose");

let config = require("../config")
console.log(config.db)
mongoose.connect("mongodb+srv://aarifpremad:zt6z1ZMe7vd5w2z6@cluster0.lq5ce.mongodb.net/scorebnabo").then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });
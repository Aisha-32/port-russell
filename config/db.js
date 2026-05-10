const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://myUser:Test1234@ac-niwya9u-shard-00-00.y2upfcv.mongodb.net:27017,ac-niwya9u-shard-00-01.y2upfcv.mongodb.net:27017,ac-niwya9u-shard-00-02.y2upfcv.mongodb.net:27017/port-russell?ssl=true&replicaSet=atlas-i9j435-shard-0&authSource=admin&retryWrites=true&w=majority");
    
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
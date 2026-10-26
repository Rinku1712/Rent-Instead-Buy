const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB is Conneected SuccessFully');
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Muhammad_shifan:muhammadshifan2006@mdsdb.joqwsjx.mongodb.net/nadhan_coffee?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // We will not exit process immediately so server can still serve mock data fallback if DB fails
  }
};

export default connectDB;

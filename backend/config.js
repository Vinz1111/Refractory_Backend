//export const PORT = 5555;
//export const mongoDBURL = 'mongodb://localhost:27017/sections-list3';
//export const mongoDBURL = 'mongodb+srv://Vinzent:mLncIXXOzT1jn1hd@cluster0.n2nya.mongodb.net/sections-list3?retryWrites=true&w=majority&appName=Cluster0';

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Successfully connnected to mongoDB 👍`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

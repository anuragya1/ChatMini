import mongoose from 'mongoose'
import { config } from './env.js'

export const connectDB = async ()=> {
  try{
    await mongoose.connect(config.mongoUri);
    console.log("Database connected");
  }
  catch(error){
      console.log("Error connecting Database : ", error);
  }
}
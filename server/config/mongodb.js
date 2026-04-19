import mongoose from "mongoose";

//TODO: how to connect with mongodb 


const connectDB = async ()=>{
   try {
      mongoose.connection.on('connected',()=>console.log("Data base Connected"));
    await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);
   } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
   }
};

export default connectDB;
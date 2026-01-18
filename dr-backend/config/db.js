import mongoose from 'mongoose'

//This file is used to connect the backend with the database
const connectDB = async () => {
    const uri = process.env.MONGO_URI
    
    if (!uri) {
        console.error("Error in dr-backend/config/db.js\nMONGO_URI is not defined");
        process.exit(1);
    }
    
    try {
        await mongoose.connect(uri)
        console.log("MongoDB Connection established\nlog in dr-backend/config/db.js");
    } catch(err) {
        console.error("Error in dr-backend/config/db.js\n", err.message);
        process.exit(1);
    }
}

export default connectDB
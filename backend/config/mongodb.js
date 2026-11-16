import mongoose from "mongoose";

const connectDB = async ()=>{

    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured')
    mongoose.connection.once('connected',()=> console.log('MongoDB connected successfully'))
    const databaseUri = process.env.MONGODB_URI.endsWith('/prescripto')
        ? process.env.MONGODB_URI
        : `${process.env.MONGODB_URI.replace(/\/$/, '')}/prescripto`
    await mongoose.connect(databaseUri)
}

export default connectDB;

import mongoose from "mongoose";

const connectDB = async() =>{
    try {
        mongoose.connection.on("connected" , ()=> 
            console.log("Database is connected")
        );
        await mongoose.connect(`${process.env.MONGODB_URL}/pingup`)
    } catch (error) {
        console.error(error.message);
    }
}

export default connectDB
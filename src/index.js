
//require('dotenv').config({path:'./env});
//you can use this but this distrubs consistency of code so we some other approach
//nut the approach is new and is experimanetal approach so you hav eto change in package.json


// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

// import dotenv from "dotenv"
// import connectDB from "./db"

// dotenv.config({
//     path:'./env'
// })
//connectDB()
// import express from "express";
// const app = express();

// // efis
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    
//     app.on("error", (error) => {
//       console.log("Express error:", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Error:", error);
//     throw error;
//   }
// })();



//SECOND APPROACH

import express from "express"
import dotenv from 'dotenv';
// Ensure this path is correct
import connectDB from "./db/index.js"
dotenv.config({ path: './env' }); // Ensure this path is correct if you are using a custom `.env` file
import { app } from "./app.js"
connectDB()
.then(() => {
    try {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 8000}`);
        });
    } catch (error) {
        console.error('Error in connecting Port:', error);
    }

})
//port connected
.catch((err)=>{
    console.log("MongoDb db connection failed",err)
});

//async method complete it gives promise
//dotenv is used for .env files hum nhi chahte baar baar hume port update krna pade
//so we define process.env aur env wale file me change kr dete hai

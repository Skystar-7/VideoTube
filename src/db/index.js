// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//   try {
//       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//       console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
//   } catch (error) {
//       console.log("MONGODB connection FAILED ", error);
//       process.exit(1)
//   }
// }
   

//     // Uncomment the line below to see what connectionInstance gives as output
//     // console.log(connectionInstance);
 


// export default connectDB;


import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MONGODB CONNECTED !! DB HOST::`, connectionInstance.connection.host)
        
    } catch(error) {
        console.log("MONGODB CONNECTIN ERROR: ", error);
        process.exit(1)
    }
}

export default connectDB

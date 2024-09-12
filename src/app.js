import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
//use in middleware
app.use(cors({
origin:process.env.CORS_ORIGIN,
credentials:true

}))

app.use(express.json({limit:"20kb"}))


app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))

app.use(cookieParser())
import userRouter from './routes/user.routes.js'


app.use("/api/v1/users",userRouter)


export {app}
//express can take json earlier it was not able to take
//when data goes in url there are some changes
//file folder ca be accessed

//some cookies can be read by server only it is considered good pratice
//express can take json earlier it was not able to take
//when data goes in url there are some changes

//routes declaration
//app.get is not used beacuse route is written seprately so middle ware is used
//MIDDLEWARE
//routes import

//as a user you send req from insta the there are two methods req and res
//What type of respond should be send
//That must be checked for that purpose middleware is used
//Ex- like if user has logged in send response according to that
//if user is admin send response according to that
//there are actually four terms (err,req,res,next)
//next is for middleware i have done my work pass to next middleware
//at last next is send then respon is send
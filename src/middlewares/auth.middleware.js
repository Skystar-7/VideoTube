import { User } from "../models/user_model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT =  asyncHandler(async(req, _,
    next)=>{
        //try to understand 
        //normally iska format aisa hi hota hai Authorization:Bearer<AccessToken>
        try{
        const token = req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401,"Unauthorized Access")
        }
          
        //Humara kaam ye bhi to hai access token match krwana 
        //Kaise kr skte hai jwt token use krke 
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).
        select("-password -refreshToken")

        if(!user){
            //frontend
            throw new ApiError(401,"Invalid Access Token")

      
        }
        req.user=user;
        next()
    }
    catch(error){
        throw new ApiError(401,"Invalid Access Token")
    }
    })
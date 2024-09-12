import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontned
  //validate -not empty
  //check if user already exists:username,email
  //check for image,check for avatar and coverimage
  //create user object-create entry in db
  //remove password and refresh token response
  //check for user creation
  //return res
  

  
  const { fullname, email, username, password } = req.body;

  console.log("email:", email);

  // Check if any field is missing
  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are mandatory");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    const conflictField = existedUser.email === email ? "email" : "username";
    throw new ApiError(409, `User with this ${conflictField} already exists`);
  }

  // Avatar file path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
//checking whether coverImage is passed or not 
if (req.files && req.files.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
  coverImageLocalPath = req.files.coverImage[0].path;
}


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Upload files to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary
  (coverImageLocalPath)
 
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Create new user in DB
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    //if cover image is passed then ok if not return empty string 
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  // Fetch created user details without sensitive info
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)
});//Done


//generate access and refresh token
const generateAccessAndRefreshTokens = async(userId)=>{
  try{
    //hum user id nikl rhe idhr 
   const user = await User.findById(userId)
   //yha pe call kr rhe methods ko access token aur refresh token methods ko  refer to user.model
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
   
    //refresh token db me bhi save krna hai aur user ke side bhi
    user.refreshToken = refreshToken
    //try to find out validation nhi chanalana idhr needed nhi hai
     await user.save({validateBeforeSave:false})
 
 
 return {
  accessToken,
  refreshToken
}

  }
  catch(error){
    throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
  }
}//Done


const loginUser=asyncHandler(async(req,res)=>{
  //req body->data
  //username or email
  //find user
  //password check
  //access and refresh token 
  //send cookie

  const {email,username,password}=req.body
  if(!(username || email)){
    throw new ApiError(400,"username or email is required")
  }
  
  const user = await User.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new ApiError(404,"User does not exists")
  }
//User is mongoDB ka method hai 
//user humara user hai 
  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
  }

//call kr rhe login me
const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
// Kuch unwanted cheze aa jati hai sath me login ke baad like pswd to hume decide krna padega ki user ko kya bhejna hai
//select method use kra humne hume pswd aur refreh token nhi bhejni to wo mention kr do
const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")

//cookies me bhejo 

const options = {
  httpOnly:true, //cookies modifiable hote hai front end se bhi
  //httpOnly true krne ke baad ye bs server e modify hoti hai
  secure: true
}

return res // set as cookie as much as possible
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken)
.json(
  new ApiResponse(
    200,{
      user:loggedInUser,accessToken, // ye hum wapis se send kr rhe may be use apne side se save
      //krna chah rha ho 
      refreshToken
    },
    "User logged In successfully"
  )
)
}) //Done


const logoutUser = asyncHandler(async(req,res)=>{
  //cookies clear krna 
  //refresh token remove krna
  //hum userId find kaise kre alg se ek form de taki user apna email add kre
  //Aise to wo kise ko bhi logout kr dega
  //here comes the concept of middleware jate hue milte jana 
   await User.findByIdAndUpdate(
    req.user._id,{
      $unset:{
        //refreshToken: undefined error
        refreshToken:1
      }
    },
      {
        new:true
      }
    
  )
const options={
  httpOnly:true,
  secure:true
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User Logged Out Successfully"))
}) //Done

//Hum yha pe refresh token match krwa rhe the new access token cookie update krenge 
const refreshAccessToken = asyncHandler(async(req,res)=>{
  //HTTP request ke cookie se nikal rhe refreshtoken aur http ke body se
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
if(!incomingRefreshToken){
  throw new ApiError(401,"Unauthorized Request")
}
 
//isme decoded token ja rha match krwa rhe client side ke refresh token to original jo bhi hai 
const decodedToken = jwt.verify(
  incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET
)

//humne db me refresh token save krwaya tha extract kr rhe usko
//kise user ka hai ki bhi nhi
const user = await User.findById(decodedToken?._id)
if(!user){
  throw new ApiError(401,"Invalid refresh Token")
}

//compare kr rhe dono ko ki valid hai bhi ya nhi token 
try{
  if(incomingRefreshToken!== user?.refreshToken){
  throw new ApiError(401,"Refresh Token is expired or used")
}
const options = {
  httpOnly:true,
  secure:true
}
const {accessToken,newrefreshToken} =await generateAccessAndRefreshTokens(user._id)
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",newrefreshToken,options)
.json(
new ApiResponse(
  200,
  {accessToken,newrefreshToken},
  "Access Token Refreshed"
)
)
}
catch(error){
  throw new ApiError(401,error?.message ||"Invalid refresh Token")
}
}) //Done

const changeCurrentPassword =  asyncHandler(async(req,res)=>{
  //oldpswd compare kr wa rhe hased pswd se id find krke
  const {oldPassword,newPassword} = req.body
  const user = await 
  User.findById(req.user?._id)
   const isPasswordCorrect = 
   await user.isPasswordCorrect(oldPassword)
 
   if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old Password")
   }
   //agr old pswd is right to update pswd as new
 user.password=newPassword
 //save krne se pehle hume sari cheze validate nhi krni hum sur hai isliye nhi krwa rhe validate
 await user.save({validateBeforeSave:false})


 return res
 .status(200)
 .json(new ApiResponse(200,{},"Password Changed Successfully"))
}) //Done


const getCurrentUser = asyncHandler(async(req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
  ))
})  //Done

const updateAccountDetails = asyncHandler(async(req,res)=>{
const {fullname,email} = req.body
if(!(fullname || email)){
  throw new ApiError(400,"All fields are required")


}

const user = await User.findByIdAndUpdate(
req.user?._id,
{
  $set:{
    fullname,
    email
  }
},
{new:true}

).select("-password")

return res
.status(200)
.json(new ApiResponse(200,user,"Account Details Updated Successfully"))


})

const updateUserAvatar = asyncHandler(async(req,res)=>{

const avatarLocalPath = req.file?.path
//incase avatar is  missing
if(!avatarLocalPath){
  throw new ApiError(400,"Avatar is missing")
}
//update krwa rhe avatar
const avatar = await uploadOnCloudinary(avatarLocalPath)
//if url missing
if(!avatar.url){
  throw new ApiError(400,"Error while uploading avatar")
}
//TODO: delete old avatar
const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      coverImage: coverImage.url
    }
  },
  {new:true}
).select("-password")


return res
.status(200)
.json(
  new ApiResponse(200,user,"Avatar Updated Successfully")
)





})


const updateUserCoverImage = asyncHandler(async(req,res)=>{

  const coverImageLocalPath = req.file?.path
  //incase avatar is  missing
  if(!coverImageLocalPath){
    throw new ApiError(400,"CoverImage is missing")
  }
  //update krwa rhe avatar
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  //if url missing
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading coverImage")
  }
  
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new:true}
  ).select("-password")


  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"CoverImage Updated Successfully")
  )

  })



//   const getUserChannelProfile = asyncHandler(async(req,res)=>{
//   const {username} = req.params
//   console.log("Received username:", username);
//   if(!username?.trim()){
//     throw new ApiError(400,"Username is missing")
//   }

//   //User.find({username})
//   const channel= await User.aggregate([
//     {
//       $match:{
//         username:username?.toLowerCase()
//       }
//     }
//     ,{
//       $lookup:{
//         //lower case and plural
//         from:"subscriptions",
//         localField:"_id",
//         foreignField:"channel",
//         as:"subscribers"
//       }
//     },{
//       $lookup:{
//         from:"subscriptions",
//         localField:"_id",
//         foreignField:"subscriber",
//         as:"subscribedTo"
//     }
//   },{
//     $addFields:{
//       subscribersCount:{
//         $size:"$subscribers"
//       },
//       channelsSubscribedToCount:{
//       $size:"$subscribeTo"
//       },
//       isSubscribed:{
//         $cond:{
          
//             if:{
//               $in:[req.user?._id,"$subscribers.subscriber"]},
//             then:true,
//             else:false
//           }
//         }
//       }
//     },{
//       $project:{
//         fullname:1,
//         username:1,
//         subscribersCount:1,
//         channelsSubscribedToCount:1,
//         isSubscribed:1,
//         avatar:1,
//         coverImage:1,
//         email:1
//       }
//     }
  
//   ])

// if(!channel?.length){
//   throw new ApiError
// }
// return res
// .status(200)
// .json(
//   new ApiResponse(200,channel[0],"User channel fetched successfully")

// )

//   })



// const getUserChannelProfile = asyncHandler(async(req, res) => {
//   const {username} = req.params

//   if (!username?.trim()) {
//       throw new ApiError(400, "username is missing")
//   }

//   const channel = await User.aggregate([
//       {
//           $match: {
//               username: username?.toLowerCase()
//           }
//       },
//       {
//           $lookup: {
//               from: "subscriptions",
//               localField: "_id",
//               foreignField: "channel",
//               as: "subscribers"
//           }
//       },
//       {
//           $lookup: {
//               from: "subscriptions",
//               localField: "_id",
//               foreignField: "subscriber",
//               as: "subscribedTo"
//           }
//       },
//       {
//           $addFields: {
//               subscribersCount: {
//                   $size: "$subscribers"
//               },
//               channelsSubscribedToCount: {
//                   $size: "$subscribedTo"
//               },
//               isSubscribed: {
//                   $cond: {
//                       if: {$in: [req.user?._id, "$subscribers.subscriber"]},
//                       then: true,
//                       else: false
//                   }
//               }
//           }
//       },
//       {
//           $project: {
//               fullName: 1,
//               username: 1,
//               subscribersCount: 1,
//               channelsSubscribedToCount: 1,
//               isSubscribed: 1,
//               avatar: 1,
//               coverImage: 1,
//               email: 1

//           }
//       }
//   ])

//   if (!channel?.length) {
//       throw new ApiError(404, "channel does not exists")
//   }

//   return res
//   .status(200)
//   .json(
//       new ApiResponse(200, channel[0], "User channel fetched successfully")
//   )
// })

const getUserChannelProfile = asyncHandler(async(req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    { $match: { username: username.toLowerCase() } },
    { $lookup: { from: "subscriptions", localField: "_id", foreignField: "channel", as: "subscribers" } },
    { $lookup: { from: "subscriptions", localField: "_id", foreignField: "subscriber", as: "subscribedTo" } },
    { $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: { $cond: { if: { $in: [req.user?._id, "$subscribers.subscriber"] }, then: true, else: false } }
      }
    },
    { $project: { fullName: 1, username: 1, subscribersCount: 1, channelsSubscribedToCount: 1, isSubscribed: 1, avatar: 1, coverImage: 1, email: 1 } }
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});


const getWatchHistory = asyncHandler(async(req,res)=>{
  //hum yha convert kr rhe string to id
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from :"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[{
               $project:{
                fullname:1,
                username:1,
                avatar:1
               }
              }
            ]
            }
          },
          {
            $addFields:{
              owner:{
                //$arrayElemAt:["$owner",0]
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
    user[0].watchHistory,
    "Watch History fetched successfully"
  )
)
})//Done

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory

};

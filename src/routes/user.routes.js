// import { Router } from "express";
// import { registerUser } from "../controllers/user.controller.js";

// const router=Router()

// router.route("/register").post(registerUser)
// export default router

import { Router } from "express";
import {
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage } 
    from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)  
//secured routes
//pehle middleware then next aapko jo fun krna hai kro
router.route("/logoutUser").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)
//.patch wrna post rakhne pe sare details update ho jaegi

router.route("/avatar").patch(verifyJWT,upload.single
    ("avatar"),updateUserAvatar)

 router.route("cover-image").patch(verifyJWT,upload.single
    ("coverImage"),updateUserCoverImage)
 //hum ye params se kr rhe isliye   
 router.route("/c/:username").get(verifyJWT, getUserChannelProfile) 

router.route("/history").get(verifyJWT,getWatchHistory)


 export default router
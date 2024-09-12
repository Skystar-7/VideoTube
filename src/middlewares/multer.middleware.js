// // import multer from "multer"
// // const storage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //       cb(null, './public/temp')
// //     },
// //     filename: function (req, file, cb) {
     
// //       cb(null, file.originalname)
// //     }
// //   })
  
// //   const upload = multer({
// //      storage,
// //      })

// //   //memory type storage can also be used 
// //   //but wo bhar jaegi isliye we are using disk
// //   //cb call back
// //   //you can add other string random number at plcae of originslfilensme
// // //Multer is used to upload files locally 
// // //local server pe file ko upload krne ke liye multer ka use kr rhe
// // //DiskStorage: Suitable for large files because it writes the files directly to the disk,
// // // avoiding the risk of consuming too much memory.



// import express from 'express';
// import { registerUser } from '../controllers/user.controller.js';
// import multer from 'multer';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/temp');
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

// const upload = multer({ storage });

// const router = express.Router();

// router.post('/register', upload.single('fileFieldName'), registerUser);

// export default router;

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})


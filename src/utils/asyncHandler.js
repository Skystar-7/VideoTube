//The DB connection code is quite common so normally ti is placed inside utils
//there are two ways to do it by try and catch
//by promise

// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }

// export {asyncHandler}




//Hum asyncHandler kyu use kr rhe
//bcz db connect me aur jgah bhi async use hoga jo error dega we need to handle this aur hume pta hona
//chahiye async ne hi error diya hai so we need to create asyncHandler
//Do trh se kr skte promise bhi return krta hai error bhi
//handle kro promise ko aur try catch block use kro
//higherorder fun
//TRY CATCH
// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try{
// await fn(req,res,next)
//     }
//     catch(error){
//         res.status(err.code ||500).json({
//             success:false,
//             message:err.message
//         })
//     }

// }




const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}
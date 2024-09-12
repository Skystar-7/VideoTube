// //We want a standarized way in which we are sending the api
// //and receivg error
// //node js api error you have to study that
// class ApiError extends Error{
//     constructor(
//         statusCode,
//         message="Something went wrong",
//         errors=[],
//         stack=""
//     )
//     {
//         super(message);
//         this.statusCode=statusCode
//         this.data=null
//         this.mesage=mesage
//         this.success=false
//         this.error=errors

//         if(stack){
//             this.stack=stack

//         }
//         else{
//             Error.captureStackTrace(this,this.constructor)


//         }
//     }
// }

// //This is fromat of API error that we are making
// export {ApiError}



class ApiError extends Error {
    constructor(
        statusCode,
        message = "Sth went wrong",
        errors = [],
        stack =""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}
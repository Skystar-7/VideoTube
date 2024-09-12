// class ApiResponse{
//     constructor(statusCode,data,message="Success"){
//         this.statusCode=statusCode;
//         this.data=data;
//         this.message=message;
//         this.sucess=statusCode<400
//     }
// }

// //server has status code 
// //response is not there in node

class ApiResponse {
    constructor(
        statusCode,
        data,
        message = "Success"
    ) {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}
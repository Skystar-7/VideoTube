import mongoose,{Schema} from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // search field enable
      },
      fullname: {
        type: String,
        required: true,
        trim: true,
        index: true, // search field enable
      },
      avatar: {
        type: String, // cloudinary
        required: true,
      },
      coverImage: {
        type: String, // cloudinary
        
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true, 
    },
      watchHistory: [
        {
          type: Schema.Types.ObjectId,
          ref: "Video",
        },
      ],
      password: {
        type: String, //   bcrypt encryption needed
        required: [true, "Password is required"],
      },
      refreshToken: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );
  
//pre hook data save hone se pehle kuch perform krwa do encyrpt kr do
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    //password hr time hash me change ho rha jaise user avatar change kr rh atb bhi
    //we want ki pswd do baar hi change ho ek wo ki sign up aur reset kr rha ho pswd to
    
    
    this.password = await bcrypt.hash(this.password,10)
    //10 is salt value means 10 rounds to convert pswd taki complexity of hash pswd increase ho
    //so why not 100 the higher salt value the more time taking in converting pswd to hash
    //few rounds are easier to break by hacker so normally 10 is considered ommon pratice
    next()
    //jb bcrypt ho rha hash ka use krke to kr kise rhe pswd ko
    //around kitne round me encypt krna hai
})




userSchema.methods.isPasswordCorrect=async function
(password){
  return await bcrypt.compare(password,this.password)
 //ek to user ka pswd hai dusra encrypted pswd hai dono ko compare kro


}


//Something like kuch certain info user ke save ho jati taki next session ke liye wapis se data verify na krna pade
//normally header payload aur signature hote
//... rest needed to study JSWT tokens

//CHECK SPELLING MAY BE WRONG


//JWT Tokens
//bcrypt password encypt bhi krti hai sath me check bhi krti hai


userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          email: this.email,
          username: this.username,
          fullName: this.fullName
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  )
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
  )
}



export const User=mongoose.model("User",userSchema)


//JWT Token
//Bearer token ki trh hai jiske pass chabhi hum use data send kr dete hai

import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema=new Schema(
    {
        videoFile:{
            type:String,
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
        type:String,
        required:true
        },

        description:{
            type:String,
            required:true
            },

            duration:{
                type:Number,
                required:true
                },

               views:{
              type:Number,
              required:true,
               },

                isPublished:{
                    type:Boolean,
                    required:true,
                },

                owner:{
                    type:Schema.Types.ObjectId,
                    ref:"User"
                }

},
{
    timestamps:true
})


videoSchema.plugin(mongooseAggregatePaginate)
//mongooseAggregatePaginate process ,sort,large data ko chunks ke form me divie krke
//ex you have 100 videos you want to show them all ek baar me 100 load krna is not efficent
//to per page hum 10 load krenge
//ya hume sort krna hai search krna hai kise specific criteria ke basis pe to hum ye use krenge 
export  const Video = mongoose.model("Video",videoSchema)

import mongoose, { Document } from "mongoose";
const { Schema } = mongoose;

const exerciseSchema = new Schema(
    {
        dateUntil:{
            type:Date,
        },
        exercise:{
            type:Object
        },
        title:{
            type:String
        },
        courseID:{
            type:String
        },
        listOfSubmitter:{
            type:Object,
        }
    }
)
export default mongoose.model("Exercise", exerciseSchema);
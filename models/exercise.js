import mongoose, { Document } from "mongoose";
const { Schema } = mongoose;

const exerciseSchema = new Schema(
    {
        dateUntil:{
            type:Date,
        },
        exercise:{
            type:Buffer
        },
        title:{
            type:String
        },
        courseID:{
            type:String
        },
        listOfSubmitter:{
            type:Array,
        }
    }
)
export default mongoose.model("Exercise", exerciseSchema);
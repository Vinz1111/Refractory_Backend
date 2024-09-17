import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema(
    {
        name: { 
            type: String, //input type text
            required: true 
        },
        value: { 
            type: String, //input type text
            required: true 
        },
        color : { 
            type: String, //input type text
            required: true 
        },
        userComment: {
            type: String,
            required: false
        },
        creatior: {
            type: String,
            required: false
        },
        role: {
            type: String,
            required: false
        },
    },
    {
        timestamps: true,
    }
);

export const Section = mongoose.model('Section', sectionSchema);
 
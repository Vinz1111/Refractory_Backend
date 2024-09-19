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
        autor: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        task: {
            type: Number,
            required: true
        },
        
        
    },
    {
        timestamps: true,
    }
);

export const Section = mongoose.model('Section', sectionSchema);
 
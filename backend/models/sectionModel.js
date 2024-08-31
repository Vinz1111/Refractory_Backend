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
        //author: {
        //    type: String,
        //    required: true
        //},
        //passwort: {
        //    type: String,
        //    required: true
        //},
    },
    {
        timestamps: true,
    }
);

export const Section = mongoose.model('Section', sectionSchema);
 
import express from 'express';
import { PORT, mongoDBURL } from './config.js';
import mongoose from 'mongoose';
import { Section } from './models/sectionModel.js';
import sectionsRoute from './routes/sectionsRoute.js';    
import cors from 'cors';

const app = express();

//Middleware for parsing JSON bodies
app.use(express.json());

//Middleware for enabling CORS

app.use(cors()); // Fügt die CORS-Header hinzu

//app.use(
//    cors({
//    origin: 'http://localhost:3000',
//    methods: ['GET, POST, PUT, DELETE'],
//    allowedHeaders: ['Content-Type'],
//    })
//);

//

app.get('/', (request, response) => {
    console.log(request); // Log a message to the console
    return response.status(234).send('Hello, World!'); // Send a response to the
});

app.use('/sections', sectionsRoute);


mongoose.connect(mongoDBURL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(5555, () => {
            console.log('Server running on 5555');
            });
        })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
        });
// packages
import express from 'express';
import cors from 'cors';
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Utiles
import connectDB from "./config.js";
import userRoutes from "./routes/userRoutes.js";
import sectionsRoute from './routes/sectionsRoute.js';  


dotenv.config();
const port = process.env.PORT || 5555;
connectDB();
const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Erlaubt nur dieses Frontend
    credentials: true, // Falls Sie Cookies oder Authentifizierung verwenden
  }));


//Middleware for parsing JSON bodies

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use('/sections', sectionsRoute);



const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));
app.listen(port, () => console.log(`Server running on port: ${port}`));

//Middleware for enabling CORS



//app.get('/', (request, response) => {
//    console.log(request); // Log a message to the console
//    return response.status(234).send('Hello, World!'); // Send a response to the
//});

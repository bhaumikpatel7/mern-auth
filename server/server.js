import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js';


const app = express();
const port = process.env.PORT || 4000;

connectDB();
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:4000'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
};

app.use(express.json());
app.use(cors(corsOptions)); 
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("API working fine")
})

app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)


app.listen(port,(req,res)=>{
    console.log(`server started on port : ${port}`);
})

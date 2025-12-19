// setup express.js
import express from 'express';
import router from './routes';
import Database from "./utils/db";
import cors from 'cors';

const app = express();
const port = 3001;

app.use(express.json());

// cors
app.use(cors({
    origin: ['http://localhost:3000', 'https://smartlib-ubharajaya.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

// connect to database
Database.connect();

app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
})

app.use('/api', router);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})


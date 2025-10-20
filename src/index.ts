// setup express.js
import express from 'express';
import connectDB from './config/db';
import dotenv from 'dotenv';
import router from './routes';

const app = express();
const port = 3000;

dotenv.config();
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
})

app.use('/api', router);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})


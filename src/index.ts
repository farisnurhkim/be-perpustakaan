// setup express.js
import express from 'express';
import router from './routes';
import Database from "./utils/db";

const app = express();
const port = 3001;

app.use(express.json());

// connect to database
Database.connect();

app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
})

app.use('/api', router);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})


import express from 'express';
import bookingsRouter from './routes/bookings.js';
import { opendb } from './model/db.js';



const app = express();
const PORT = 8000;

app.use(express.json());

app.use('/api', bookingsRouter)



app.listen(PORT, () => {
    opendb()
    console.log(`Server started (PORT: ${PORT})`);
});
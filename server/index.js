import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './connection/connection.js';
import cors from 'cors';
import router from './routes/index.js';


dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); 
app.use(cors()); // Enable CORS


app.use('/', router);

const PORT = process.env.PORT || 5000;

// Connect to the database
connectDb();

// Routes
app.get('/', async (req, res) => {
  res.send("Server is working");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

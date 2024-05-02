import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import connectToDb from './db.js';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/container.js';


// Connect to the database
connectToDb();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/container', documentRoutes);

// Start the server
const PORT = process.env.EXPRESS_PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
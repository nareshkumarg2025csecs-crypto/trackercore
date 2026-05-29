import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Initialize dotenv environment configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Apply Middleware
app.use(cors({
  origin: FRONTEND_URL
}));
app.use(express.json());

// Route Definitions
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Health Check Root Route
app.get('/', (req, res) => {
  res.json({ message: 'GreenLedger API Terminal is active.' });
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`GreenLedger backend running on port ${PORT}`);
});

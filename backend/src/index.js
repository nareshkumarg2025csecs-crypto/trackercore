import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dotenv environment configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Apply Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// API Route Definitions
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// --- Single Server Setup (Serve Frontend from Backend) ---
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// Serve static files from the React build
app.use(express.static(frontendDistPath));

// Catch-all route: send back React's index.html for any unhandled routes (supports client-side routing)
app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`GreenLedger Monolithic Server running on port ${PORT}`);
});

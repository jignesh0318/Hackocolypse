import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import zonesRoutes from './routes/zones';
import reportsRoutes from './routes/reports';
import alertsRoutes from './routes/alerts';
import safetyAnalysisRoutes from './routes/safetyAnalysis';
import chatbotRoutes from './routes/chatbot';
import bubblesRoutes from './routes/bubbles';
import voiceRoutes from './routes/voice';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/safety-analysis', safetyAnalysisRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/bubbles', bubblesRoutes);
app.use('/api/voice', voiceRoutes);

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
} else {
  console.warn('MONGODB_URI not configured - database features may not work');
}

// Start the server
app.listen(Number(PORT), HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
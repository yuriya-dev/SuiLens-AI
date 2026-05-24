import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import apiRouter from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Define production rate limiting (max 100 queries per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Enable CORS so client running on port 3000 can query port 3001
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API route gateway middleware with rate limiter
app.use('/api', apiLimiter, apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), platform: 'SuiLens AI Core' });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`   SuiLens AI API Server is Booted!    `);
  console.log(`   Running: http://localhost:${PORT}    `);
  console.log(`========================================`);
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { setupBot } from './bot.js';
import scoreRoutes from './routes/score.js';
import leaderboardRoutes from './routes/leaderboard.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

// Init database
initDb();
console.log('Database initialized');

// Init Express
const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/score', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start Telegram bot (webhook mode — registers POST endpoint on app)
setupBot(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

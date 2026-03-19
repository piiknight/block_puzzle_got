# Phase 5: Backend & Telegram Integration

## Tasks

### 5.1 Express Server Setup
```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { setupBot } from './bot';
import { initDb } from './db';
import scoreRoutes from './routes/score';
import leaderboardRoutes from './routes/leaderboard';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/score', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

initDb();
setupBot(app);
app.listen(3000);
```

### 5.2 Telegram Bot Setup
```typescript
// server/src/bot.ts
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

bot.onText(/\/start/, (msg) => {
  bot.sendGame(msg.chat.id, 'blockblast');
  // OR send inline keyboard with Mini App URL
});
```
- Register bot with @BotFather
- Set Mini App URL via BotFather
- `/start` command opens the game

### 5.3 SQLite Database
```sql
CREATE TABLE users (
  telegram_id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  high_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER REFERENCES users(telegram_id),
  score INTEGER NOT NULL,
  played_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_score ON scores(score DESC);
```

### 5.4 Auth - Validate initData
```typescript
// server/src/auth.ts
import crypto from 'crypto';

export function validateInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}
```

### 5.5 Score API
```
POST /api/score        - Save score (with initData validation)
GET  /api/score/:id    - Get user's high score
GET  /api/leaderboard  - Top 100 scores
```

### 5.6 Client API Integration
```typescript
// client/src/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function saveScore(score: number): Promise<void> {
  const initData = window.Telegram.WebApp.initData;
  await fetch(`${API_URL}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, initData }),
  });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/api/leaderboard`);
  return res.json();
}
```

## Deliverable
- Working Express server with SQLite
- Bot responds to /start with game link
- Scores saved and validated securely
- Leaderboard API functional

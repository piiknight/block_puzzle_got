import { Router } from 'express';
import { getDb } from '../db.js';

interface LeaderboardRow {
  telegram_id: number;
  username: string | null;
  first_name: string;
  high_score: number;
}

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();

  const rows = db.prepare(`
    SELECT telegram_id, username, first_name, high_score
    FROM users
    WHERE high_score > 0
    ORDER BY high_score DESC
    LIMIT 100
  `).all() as LeaderboardRow[];

  const leaderboard = rows.map((row, index) => ({
    rank: index + 1,
    telegramId: row.telegram_id,
    name: row.username || row.first_name,
    score: row.high_score,
  }));

  res.json(leaderboard);
});

export default router;

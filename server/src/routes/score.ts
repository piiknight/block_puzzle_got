import { Router } from 'express';
import { getDb } from '../db.js';
import { validateInitData } from '../auth.js';

const router = Router();
const BOT_TOKEN = process.env.BOT_TOKEN || '';

// Save score
router.post('/', (req, res) => {
  const { score, initData } = req.body;

  if (typeof score !== 'number' || score < 0) {
    res.status(400).json({ error: 'Invalid score' });
    return;
  }

  const auth = validateInitData(initData, BOT_TOKEN);
  if (!auth.valid || !auth.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const db = getDb();
  const user = auth.user;

  // Upsert user
  db.prepare(`
    INSERT INTO users (telegram_id, username, first_name, games_played)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(telegram_id) DO UPDATE SET
      username = excluded.username,
      first_name = excluded.first_name,
      games_played = games_played + 1
  `).run(user.id, user.username || null, user.first_name);

  // Update high score if needed
  db.prepare(`
    UPDATE users SET high_score = ? WHERE telegram_id = ? AND high_score < ?
  `).run(score, user.id, score);

  // Insert score record
  db.prepare(`
    INSERT INTO scores (telegram_id, score) VALUES (?, ?)
  `).run(user.id, score);

  const userData = db.prepare(`
    SELECT high_score, games_played FROM users WHERE telegram_id = ?
  `).get(user.id) as { high_score: number; games_played: number } | undefined;

  res.json({
    success: true,
    highScore: userData?.high_score || score,
    gamesPlayed: userData?.games_played || 1,
  });
});

// Get user stats
router.get('/:telegramId', (req, res) => {
  const telegramId = parseInt(req.params.telegramId, 10);
  if (isNaN(telegramId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  const db = getDb();
  const user = db.prepare(`
    SELECT high_score, games_played FROM users WHERE telegram_id = ?
  `).get(telegramId) as { high_score: number; games_played: number } | undefined;

  if (!user) {
    res.json({ highScore: 0, gamesPlayed: 0 });
    return;
  }

  res.json({
    highScore: user.high_score,
    gamesPlayed: user.games_played,
  });
});

export default router;

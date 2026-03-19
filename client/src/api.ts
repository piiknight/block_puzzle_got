const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getInitData(): string {
  return window.Telegram?.WebApp?.initData || '';
}

export async function saveScore(score: number): Promise<{ highScore: number; gamesPlayed: number }> {
  const res = await fetch(`${API_URL}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, initData: getInitData() }),
  });
  if (!res.ok) throw new Error('Failed to save score');
  return res.json();
}

export async function getUserStats(telegramId: number): Promise<{ highScore: number; gamesPlayed: number }> {
  const res = await fetch(`${API_URL}/api/score/${telegramId}`);
  if (!res.ok) throw new Error('Failed to get stats');
  return res.json();
}

export interface LeaderboardEntry {
  rank: number;
  telegramId: number;
  name: string;
  score: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/api/leaderboard`);
  if (!res.ok) throw new Error('Failed to get leaderboard');
  return res.json();
}

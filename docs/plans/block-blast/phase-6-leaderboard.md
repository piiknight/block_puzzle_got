# Phase 6: Leaderboard UI & Final Integration

## Tasks

### 6.1 Leaderboard Screen
- Tab/button to switch between Game and Leaderboard
- Show top 100 players: rank, name, score
- Highlight current user's position
- Pull-to-refresh or auto-refresh

### 6.2 Share Score
```typescript
// After game over
function shareScore(score: number) {
  const text = `I scored ${score} in Block Blast! Can you beat me?`;
  window.Telegram.WebApp.switchInlineQuery(text);
  // OR use share URL
}
```

### 6.3 Telegram Theme Integration
- Read `themeParams` for all colors
- Listen to `themeChanged` event
- Apply theme to: grid bg, cell borders, text, buttons
- Support both dark and light mode seamlessly

### 6.4 Responsive Design
- Calculate cell size from viewport dimensions
- Minimum touch target: 44px per cell
- Piece selection area scales with remaining space
- Safe area insets for notched devices
- Test: small phones (320px) to tablets

### 6.5 Production Build
- Vite build with minification
- Inline critical CSS
- Asset optimization (compress images if any)
- Environment variables for API URL
- HTTPS setup (required for Telegram Mini Apps)

### 6.6 Deployment
- Option A: VPS with nginx reverse proxy + Let's Encrypt
- Option B: Cloudflare Pages (client) + Workers (API)
- Configure BotFather with production URL
- Set webhook for bot

## Deliverable
- Complete, polished game
- Leaderboard with live scores
- Share functionality
- Production-ready build
- Deployment guide

# Block Blast - Telegram Mini App Game

## Overview
Block Blast puzzle game chạy trên Telegram Mini App. Người chơi kéo thả các khối vào lưới 8x8, xóa hàng/cột khi đầy, ghi điểm combo.

## Tech Stack
- **Frontend**: TypeScript + Vite + HTML5 Canvas
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (better-sqlite3)
- **Telegram**: Web App API (`telegram-web-app.js`)

## Project Structure
```
game_on_telegram/
├── client/                    # Frontend (Vite + TS)
│   ├── index.html
│   ├── src/
│   │   ├── main.ts           # Entry point, Telegram SDK init
│   │   ├── game/
│   │   │   ├── Game.ts       # Game loop, state machine
│   │   │   ├── Board.ts      # 8x8 grid logic
│   │   │   ├── Piece.ts      # Block shapes definition
│   │   │   ├── Renderer.ts   # Canvas rendering
│   │   │   ├── Input.ts      # Touch/mouse drag & drop
│   │   │   ├── Score.ts      # Scoring & combo system
│   │   │   └── Audio.ts      # Sound effects (optional)
│   │   ├── telegram.ts       # Telegram Web App wrapper
│   │   ├── api.ts            # Backend API calls
│   │   └── types.ts          # Shared types
│   ├── public/
│   │   └── assets/           # Images, sounds
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                    # Backend (Express + TS)
│   ├── src/
│   │   ├── index.ts          # Express server + bot webhook
│   │   ├── bot.ts            # Telegram Bot setup
│   │   ├── routes/
│   │   │   ├── score.ts      # Score API endpoints
│   │   │   └── leaderboard.ts
│   │   ├── db.ts             # SQLite setup
│   │   └── auth.ts           # Validate Telegram initData
│   ├── tsconfig.json
│   └── package.json
├── package.json               # Root workspace
└── .env
```

## Implementation Phases

### Phase 1: Project Setup & Core Grid
**File**: `phase-1-setup.md`
- Init Vite + TypeScript project
- Setup Canvas with responsive sizing
- Implement Board class (8x8 grid data structure)
- Render empty grid with Telegram theme colors
- Basic touch/mouse event handling

### Phase 2: Block Pieces & Drag-Drop
**File**: `phase-2-pieces.md`
- Define all block shapes (15+ shapes)
- Render 3 random pieces in selection area
- Implement drag & drop with touch support
- Ghost preview on grid while dragging
- Snap-to-grid placement validation

### Phase 3: Game Logic & Scoring
**File**: `phase-3-logic.md`
- Row/column clearing when full
- Scoring system: base points + combo multiplier
- Combo detection (multiple clears in one placement)
- Game over detection (no valid placements)
- New pieces generation after all 3 placed

### Phase 4: Polish & Animations
**File**: `phase-4-polish.md`
- Clear animation (flash + fade)
- Piece placement animation
- Score popup animation
- Haptic feedback via Telegram API
- Game over screen with score

### Phase 5: Backend & Telegram Integration
**File**: `phase-5-backend.md`
- Express server with Telegram Bot
- SQLite schema (users, scores)
- Validate Telegram initData (HMAC)
- Save/load high scores API
- Leaderboard endpoint
- Bot commands (/start → opens Mini App)

### Phase 6: Leaderboard UI & Final Integration
**File**: `phase-6-leaderboard.md`
- Leaderboard screen in game
- Share score button
- Telegram theme integration (dark/light)
- Responsive design for all screen sizes
- Production build & deploy setup

## Game Mechanics Detail

### Grid
- 8x8 cells
- Each cell: empty or filled with color

### Block Shapes (15 types)
```
Single: ■
2-line: ■■  or vertical
3-line: ■■■ or vertical
4-line: ■■■■ or vertical
5-line: ■■■■■ or vertical
2x2:    ■■ / ■■
3x3:    ■■■ / ■■■ / ■■■
L-shapes: ■■ / ■  (and rotations)
T-shape:  ■■■ / _■
S/Z shapes
Corner 2x2: ■■ / ■_ (and rotations)
```

### Scoring
- Base: 10 points per cell placed
- Row/column clear: 100 points per line
- Combo: x2 for 2 lines, x3 for 3, etc.
- Streak bonus: consecutive turns with clears

### Game Over
- None of the 3 available pieces can fit anywhere on the board

## Key Technical Decisions

1. **Canvas vs DOM**: Canvas — smoother animations, better performance for grid rendering
2. **No game engine**: Game is simple enough for raw Canvas API
3. **Touch handling**: Use pointer events (unified mouse + touch)
4. **Telegram theme**: Read `window.Telegram.WebApp.themeParams` for colors
5. **Auth**: Validate `initData` server-side using HMAC-SHA256 with bot token
6. **Monorepo**: Simple workspace with `client/` and `server/` directories

# Phase 1: Project Setup & Core Grid

## Tasks

### 1.1 Initialize Project
- Create root `package.json` with workspaces
- Init Vite project in `client/` with TypeScript template
- Init Express project in `server/` with TypeScript
- Configure `tsconfig.json` for both

### 1.2 Canvas Setup
- Create `index.html` with full-viewport canvas
- `main.ts`: Init canvas, handle resize, start game loop
- Responsive sizing: fit Telegram WebView viewport
- Use `requestAnimationFrame` for game loop

### 1.3 Board Data Structure
```typescript
class Board {
  readonly size = 8;
  grid: number[][]; // 0 = empty, 1-7 = color index

  canPlace(piece: Piece, row: number, col: number): boolean;
  place(piece: Piece, row: number, col: number): void;
  getFullRows(): number[];
  getFullCols(): number[];
  clearLines(rows: number[], cols: number[]): number;
}
```

### 1.4 Grid Rendering
```typescript
class Renderer {
  constructor(ctx: CanvasRenderingContext2D, theme: ThemeColors);

  drawGrid(board: Board): void;      // Grid lines + filled cells
  drawCell(row: number, col: number, color: string): void;
  clear(): void;
}
```
- Cell size = canvas width / 8 (with padding)
- Grid lines: subtle, theme-aware
- Filled cells: rounded rectangles with slight gradient

### 1.5 Telegram SDK Init
```typescript
// telegram.ts
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // Full screen

export const theme = {
  bg: tg.themeParams.bg_color || '#1a1a2e',
  text: tg.themeParams.text_color || '#ffffff',
  button: tg.themeParams.button_color || '#6c5ce7',
  hint: tg.themeParams.hint_color || '#888888',
};
```

## Deliverable
- Empty 8x8 grid rendered on screen
- Responsive to Telegram viewport
- Theme colors from Telegram
- Game loop running at 60fps

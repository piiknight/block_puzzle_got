# Phase 3: Game Logic & Scoring

## Tasks

### 3.1 Line Clearing
```typescript
// After placing a piece:
const fullRows = board.getFullRows(); // check all 8 rows
const fullCols = board.getFullCols(); // check all 8 cols
const linesCleared = board.clearLines(fullRows, fullCols);
```
- Check immediately after each piece placement
- Clear all full rows AND columns simultaneously
- A cell at intersection of full row + full col counts once

### 3.2 Scoring System
```typescript
class Score {
  current: number = 0;
  highScore: number = 0;
  combo: number = 0;

  addPlacement(cellCount: number): number;     // 10 per cell
  addClear(lineCount: number): number;         // 100 * lines * combo
  resetCombo(): void;                          // called when no lines cleared
}
```

**Scoring rules:**
- Place piece: +10 per cell in the piece
- Clear 1 line: +100
- Clear 2 lines: +300 (100 × 2 × 1.5)
- Clear 3 lines: +600 (100 × 3 × 2)
- Clear 4+ lines: +100 × n × (n-1)
- Combo: consecutive turns with clears multiply score ×1.5

### 3.3 Game Over Detection
```typescript
function isGameOver(board: Board, pieces: Piece[]): boolean {
  for (const piece of pieces) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board.canPlace(piece, r, c)) return false;
      }
    }
  }
  return true;
}
```
- Check after each placement
- Game over when NO remaining piece fits ANYWHERE
- Only check remaining (unplaced) pieces

### 3.4 New Pieces Generation
- After all 3 pieces placed → generate 3 new random pieces
- Weighted randomness: smaller pieces more common
- Ensure at least one piece can be placed (optional fairness)

### 3.5 Score Display
- Current score: top-center, large font
- High score: top-right, smaller
- Combo indicator: flash "COMBO x2!" etc.

## Deliverable
- Full rows/columns clear when filled
- Score updates with combo multiplier
- Game over detected and shown
- New pieces generated after all 3 placed

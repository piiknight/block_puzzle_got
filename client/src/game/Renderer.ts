import type { ThemeColors, PieceShape } from '../types.ts';
import { GRID_SIZE, CELL_COLORS } from '../types.ts';
import { getPieceBounds } from './Piece.ts';
import type { Board } from './Board.ts';

export interface Layout {
  gridX: number;
  gridY: number;
  cellSize: number;
  gridPx: number;
  pieceAreaY: number;
  pieceAreaHeight: number;
  padding: number;
}

export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private dpr: number;
  theme: ThemeColors;
  layout!: Layout;

  constructor(canvas: HTMLCanvasElement, theme: ThemeColors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.theme = theme;
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
  }

  resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.calculateLayout(w, h);
  }

  private calculateLayout(w: number, h: number): void {
    const padding = Math.floor(w * 0.04);
    const availableWidth = w - padding * 2;

    // Grid takes up ~65% of height, piece area takes ~25%
    const scoreHeight = 60;
    const gapBetween = 20;
    const availableForGrid = h - scoreHeight - gapBetween - padding * 2;
    const maxGridFromHeight = Math.floor(availableForGrid * 0.65);

    const cellSize = Math.floor(Math.min(availableWidth / GRID_SIZE, maxGridFromHeight / GRID_SIZE));
    const gridPx = cellSize * GRID_SIZE;
    const gridX = Math.floor((w - gridPx) / 2);
    const gridY = scoreHeight + padding;

    const pieceAreaY = gridY + gridPx + gapBetween;
    const pieceAreaHeight = h - pieceAreaY - padding;

    this.layout = { gridX, gridY, cellSize, gridPx, pieceAreaY, pieceAreaHeight, padding };
  }

  clear(): void {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    this.ctx.fillStyle = this.theme.bg;
    this.ctx.fillRect(0, 0, w, h);
  }

  drawGrid(board: Board): void {
    const { gridX, gridY, cellSize, gridPx } = this.layout;
    const ctx = this.ctx;

    // Grid background
    ctx.fillStyle = this.theme.gridBg;
    ctx.beginPath();
    this.roundRect(ctx, gridX, gridY, gridPx, gridPx, 8);
    ctx.fill();

    // Draw cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = gridX + c * cellSize;
        const y = gridY + r * cellSize;
        const val = board.grid[r][c];

        if (val > 0) {
          this.drawCell(x, y, cellSize, CELL_COLORS[val - 1]);
        } else {
          // Empty cell
          ctx.fillStyle = this.theme.gridBg;
          ctx.strokeStyle = this.theme.gridLine;
          ctx.lineWidth = 1;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }
  }

  drawCell(x: number, y: number, size: number, color: string): void {
    const ctx = this.ctx;
    const gap = 2;
    const radius = 4;

    ctx.fillStyle = color;
    ctx.beginPath();
    this.roundRect(ctx, x + gap, y + gap, size - gap * 2, size - gap * 2, radius);
    ctx.fill();

    // Highlight (top-left shine)
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    this.roundRect(ctx, x + gap, y + gap, size - gap * 2, (size - gap * 2) * 0.35, radius);
    ctx.fill();
  }

  drawPieces(pieces: (PieceShape | null)[], selectedIndex: number): void {
    const { pieceAreaY, pieceAreaHeight, padding } = this.layout;
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;

    // Piece area width divided into 3 slots
    const slotWidth = (w - padding * 2) / 3;
    const pieceCellSize = Math.min(Math.floor(slotWidth / 6), Math.floor(pieceAreaHeight / 6));

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (!piece) continue;

      const bounds = getPieceBounds(piece);
      const pieceW = bounds.cols * pieceCellSize;
      const pieceH = bounds.rows * pieceCellSize;
      const slotX = padding + slotWidth * i + (slotWidth - pieceW) / 2;
      const slotY = pieceAreaY + (pieceAreaHeight - pieceH) / 2;

      // Dim if selected (being dragged)
      if (i === selectedIndex) {
        ctx.globalAlpha = 0.3;
      }

      for (const [dr, dc] of piece.cells) {
        this.drawCell(
          slotX + dc * pieceCellSize,
          slotY + dr * pieceCellSize,
          pieceCellSize,
          CELL_COLORS[piece.color - 1]
        );
      }

      ctx.globalAlpha = 1;
    }
  }

  drawGhost(piece: PieceShape, gridRow: number, gridCol: number, valid: boolean): void {
    const { gridX, gridY, cellSize } = this.layout;
    const ctx = this.ctx;

    ctx.globalAlpha = valid ? 0.4 : 0.2;

    for (const [dr, dc] of piece.cells) {
      const x = gridX + (gridCol + dc) * cellSize;
      const y = gridY + (gridRow + dr) * cellSize;
      const color = valid ? CELL_COLORS[piece.color - 1] : '#ff0000';
      this.drawCell(x, y, cellSize, color);
    }

    ctx.globalAlpha = 1;
  }

  drawScore(score: number, highScore: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const { padding } = this.layout;

    // Current score - center
    ctx.fillStyle = this.theme.text;
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score.toString(), w / 2, padding + 20);

    // High score - right
    ctx.fillStyle = this.theme.textSecondary;
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Best: ${highScore}`, w - padding, padding + 12);

    // Title - left
    ctx.fillStyle = this.theme.text;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Block Blast', padding, padding + 12);
  }

  drawGameOver(score: number, highScore: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    // Game Over text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 60);

    // Score
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(`Score: ${score}`, w / 2, h / 2);

    if (score >= highScore) {
      ctx.fillStyle = '#FFEAA7';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('New High Score!', w / 2, h / 2 + 35);
    }

    // Play Again button
    const btnW = 200;
    const btnH = 50;
    const btnX = (w - btnW) / 2;
    const btnY = h / 2 + 70;

    ctx.fillStyle = this.theme.button;
    ctx.beginPath();
    this.roundRect(ctx, btnX, btnY, btnW, btnH, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('Play Again', w / 2, btnY + btnH / 2);

    // Leaderboard button
    const lbBtnY = btnY + btnH + 15;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    this.roundRect(ctx, btnX, lbBtnY, btnW, btnH, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Leaderboard', w / 2, lbBtnY + btnH / 2);
  }

  getPlayAgainBounds(): { x: number; y: number; w: number; h: number } {
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    const btnW = 200;
    const btnH = 50;
    return {
      x: (w - btnW) / 2,
      y: h / 2 + 70,
      w: btnW,
      h: btnH,
    };
  }

  getLeaderboardBtnBounds(): { x: number; y: number; w: number; h: number } {
    const playAgain = this.getPlayAgainBounds();
    return {
      x: playAgain.x,
      y: playAgain.y + playAgain.h + 15,
      w: playAgain.w,
      h: 50,
    };
  }

  getPieceSlotBounds(): { x: number; y: number; w: number; h: number }[] {
    const { pieceAreaY, pieceAreaHeight, padding } = this.layout;
    const w = this.canvas.width / this.dpr;
    const slotWidth = (w - padding * 2) / 3;

    return [0, 1, 2].map(i => ({
      x: padding + slotWidth * i,
      y: pieceAreaY,
      w: slotWidth,
      h: pieceAreaHeight,
    }));
  }

  screenToGrid(px: number, py: number): { row: number; col: number } | null {
    const { gridX, gridY, cellSize, gridPx } = this.layout;
    if (px < gridX || px > gridX + gridPx || py < gridY || py > gridY + gridPx) {
      return null;
    }
    return {
      row: Math.floor((py - gridY) / cellSize),
      col: Math.floor((px - gridX) / cellSize),
    };
  }

  drawLeaderboard(entries: { rank: number; name: string; score: number; telegramId: number }[], currentUserId?: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Leaderboard', w / 2, 40);

    // Close button (top-right)
    ctx.fillStyle = this.theme.textSecondary;
    ctx.font = '24px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('✕', w - 20, 40);

    if (entries.length === 0) {
      ctx.fillStyle = this.theme.textSecondary;
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No scores yet. Be the first!', w / 2, h / 2);
      return;
    }

    // List
    const startY = 80;
    const rowH = 40;
    const maxVisible = Math.min(entries.length, Math.floor((h - startY - 20) / rowH));

    for (let i = 0; i < maxVisible; i++) {
      const entry = entries[i];
      const y = startY + i * rowH;
      const isCurrentUser = entry.telegramId === currentUserId;

      // Highlight current user
      if (isCurrentUser) {
        ctx.fillStyle = 'rgba(108, 92, 231, 0.3)';
        ctx.fillRect(10, y - rowH / 2 + 5, w - 20, rowH - 2);
      }

      // Medal for top 3
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'left';
      if (entry.rank === 1) ctx.fillStyle = '#FFD700';
      else if (entry.rank === 2) ctx.fillStyle = '#C0C0C0';
      else if (entry.rank === 3) ctx.fillStyle = '#CD7F32';
      else ctx.fillStyle = this.theme.textSecondary;

      ctx.fillText(`${entry.rank}.`, 20, y);

      // Name
      ctx.fillStyle = isCurrentUser ? '#ffffff' : this.theme.text;
      ctx.font = isCurrentUser ? 'bold 16px system-ui, sans-serif' : '16px system-ui, sans-serif';
      ctx.textAlign = 'left';
      const name = entry.name.length > 15 ? entry.name.slice(0, 15) + '…' : entry.name;
      ctx.fillText(name, 50, y);

      // Score
      ctx.fillStyle = isCurrentUser ? '#FFEAA7' : this.theme.text;
      ctx.textAlign = 'right';
      ctx.fillText(entry.score.toLocaleString(), w - 20, y);
    }
  }

  getLeaderboardCloseBounds(): { x: number; y: number; w: number; h: number } {
    const w = this.canvas.width / this.dpr;
    return { x: w - 50, y: 15, w: 40, h: 40 };
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

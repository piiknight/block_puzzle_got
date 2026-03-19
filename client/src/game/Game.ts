import type { PieceShape } from '../types.ts';
import { CELL_COLORS } from '../types.ts';
import { Board } from './Board.ts';
import { Renderer } from './Renderer.ts';
import { Input } from './Input.ts';
import { Score } from './Score.ts';
import { generatePieces, getPieceBounds } from './Piece.ts';
import { getTheme, haptic } from '../telegram.ts';
import { saveScore, getLeaderboard } from '../api.ts';
import type { LeaderboardEntry } from '../api.ts';

export class Game {
  private board: Board;
  private renderer: Renderer;
  private input: Input;
  private score: Score;
  private pieces: (PieceShape | null)[] = [];
  private gameOver = false;
  private animating = false;
  private showingLeaderboard = false;
  private leaderboardData: LeaderboardEntry[] = [];
  private currentUserId?: number;

  // Clear animation state
  private clearingCells: { row: number; col: number }[] = [];
  private clearAnimProgress = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.board = new Board();
    this.score = new Score();
    this.renderer = new Renderer(canvas, getTheme());

    this.currentUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    this.input = new Input(canvas, this.renderer, {
      onPlace: this.handlePlace.bind(this),
      onRestart: this.restart.bind(this),
      onLeaderboard: this.openLeaderboard.bind(this),
      onCloseLeaderboard: this.closeLeaderboard.bind(this),
    });

    this.pieces = generatePieces(3);
    this.input.updatePieces(this.pieces);

    window.addEventListener('resize', () => {
      this.renderer.resize();
    });

    this.loop();
  }

  private handlePlace(pieceIndex: number, row: number, col: number): void {
    const piece = this.pieces[pieceIndex];
    if (!piece || this.gameOver || this.animating) return;

    if (!this.board.canPlace(piece, row, col)) {
      haptic('error');
      return;
    }

    // Place piece
    this.board.place(piece, row, col);
    this.score.addPlacement(piece.cells.length);
    this.pieces[pieceIndex] = null;
    haptic('medium');

    // Check for line clears
    const fullRows = this.board.getFullRows();
    const fullCols = this.board.getFullCols();
    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      this.clearingCells = [];
      for (const r of fullRows) {
        for (let c = 0; c < this.board.size; c++) {
          this.clearingCells.push({ row: r, col: c });
        }
      }
      for (const c of fullCols) {
        for (let r = 0; r < this.board.size; r++) {
          if (!fullRows.includes(r)) {
            this.clearingCells.push({ row: r, col: c });
          }
        }
      }

      this.board.clearLines(fullRows, fullCols);
      this.score.addClear(totalLines);
      haptic('heavy');

      this.animating = true;
      this.clearAnimProgress = 0;
    } else {
      this.score.addClear(0);
    }

    // Check if need new pieces
    const remaining = this.pieces.filter(p => p !== null) as PieceShape[];
    if (remaining.length === 0) {
      this.pieces = generatePieces(3);
    }

    this.input.updatePieces(this.pieces);

    // Check game over
    const activePieces = this.pieces.filter(p => p !== null) as PieceShape[];
    if (!this.board.hasAnyValidPlacement(activePieces)) {
      this.gameOver = true;
      this.input.setGameOver(true);
      haptic('error');
      saveScore(this.score.current).catch(() => {});
    }
  }

  private restart(): void {
    this.board.reset();
    this.score.reset();
    this.pieces = generatePieces(3);
    this.gameOver = false;
    this.animating = false;
    this.showingLeaderboard = false;
    this.clearingCells = [];
    this.input.updatePieces(this.pieces);
    this.input.setGameOver(false);
    this.input.showingLeaderboard = false;
  }

  private openLeaderboard(): void {
    this.showingLeaderboard = true;
    this.input.showingLeaderboard = true;
    getLeaderboard()
      .then(data => { this.leaderboardData = data; })
      .catch(() => { this.leaderboardData = []; });
  }

  private closeLeaderboard(): void {
    this.showingLeaderboard = false;
    this.input.showingLeaderboard = false;
  }

  private loop(): void {
    // Update animation
    if (this.animating) {
      this.clearAnimProgress += 0.05;
      if (this.clearAnimProgress >= 1) {
        this.animating = false;
        this.clearingCells = [];
      }
    }

    // Render
    this.renderer.clear();
    this.renderer.drawScore(this.score.current, this.score.highScore);
    this.renderer.drawGrid(this.board);

    if (this.animating && this.clearingCells.length > 0) {
      this.drawClearAnimation();
    }

    // Ghost preview
    const drag = this.input.getDragState();
    if (drag && drag.onGrid) {
      const valid = this.board.canPlace(drag.piece, drag.gridRow, drag.gridCol);
      this.renderer.drawGhost(drag.piece, drag.gridRow, drag.gridCol, valid);
    }

    if (drag) {
      this.drawDraggedPiece(drag);
    }

    this.renderer.drawPieces(this.pieces, drag?.pieceIndex ?? -1);

    // Overlays
    if (this.showingLeaderboard) {
      this.renderer.drawLeaderboard(this.leaderboardData, this.currentUserId);
    } else if (this.gameOver && !this.animating) {
      this.renderer.drawGameOver(this.score.current, this.score.highScore);
    }

    requestAnimationFrame(() => this.loop());
  }

  private drawDraggedPiece(drag: { piece: PieceShape; screenX: number; screenY: number }): void {
    const { cellSize } = this.renderer.layout;
    const bounds = getPieceBounds(drag.piece);
    const offsetX = (bounds.cols * cellSize) / 2;
    const offsetY = (bounds.rows * cellSize) / 2;

    for (const [dr, dc] of drag.piece.cells) {
      this.renderer.drawCell(
        drag.screenX - offsetX + dc * cellSize,
        drag.screenY - offsetY + dr * cellSize,
        cellSize,
        CELL_COLORS[drag.piece.color - 1]
      );
    }
  }

  private drawClearAnimation(): void {
    const { gridX, gridY, cellSize } = this.renderer.layout;
    const ctx = this.renderer.ctx;
    const alpha = 1 - this.clearAnimProgress;
    const scale = 1 - this.clearAnimProgress * 0.5;

    ctx.globalAlpha = alpha;
    for (const { row, col } of this.clearingCells) {
      const cx = gridX + col * cellSize + cellSize / 2;
      const cy = gridY + row * cellSize + cellSize / 2;
      const size = cellSize * scale;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }
}

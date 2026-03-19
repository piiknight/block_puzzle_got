import type { PieceShape } from '../types.ts';
import type { Renderer } from './Renderer.ts';
import { getPieceBounds } from './Piece.ts';

export interface DragState {
  pieceIndex: number;
  piece: PieceShape;
  screenX: number;
  screenY: number;
  gridRow: number;
  gridCol: number;
  onGrid: boolean;
}

export class Input {
  private renderer: Renderer;
  private dragState: DragState | null = null;
  private onPlace: (pieceIndex: number, row: number, col: number) => void;
  private onRestart: () => void;
  private onLeaderboard: () => void;
  private onCloseLeaderboard: () => void;
  private pieces: (PieceShape | null)[] = [];
  private gameOver = false;
  showingLeaderboard = false;

  constructor(
    canvas: HTMLCanvasElement,
    renderer: Renderer,
    callbacks: {
      onPlace: (pieceIndex: number, row: number, col: number) => void;
      onRestart: () => void;
      onLeaderboard: () => void;
      onCloseLeaderboard: () => void;
    }
  ) {
    this.renderer = renderer;
    this.onPlace = callbacks.onPlace;
    this.onRestart = callbacks.onRestart;
    this.onLeaderboard = callbacks.onLeaderboard;
    this.onCloseLeaderboard = callbacks.onCloseLeaderboard;

    canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
    canvas.addEventListener('pointercancel', this.onPointerUp.bind(this));
  }

  updatePieces(pieces: (PieceShape | null)[]): void {
    this.pieces = pieces;
  }

  setGameOver(gameOver: boolean): void {
    this.gameOver = gameOver;
  }

  getDragState(): DragState | null {
    return this.dragState;
  }

  private hitTest(x: number, y: number, bounds: { x: number; y: number; w: number; h: number }): boolean {
    return x >= bounds.x && x <= bounds.x + bounds.w && y >= bounds.y && y <= bounds.y + bounds.h;
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);

    const x = e.clientX;
    const y = e.clientY;

    // Leaderboard view
    if (this.showingLeaderboard) {
      const closeBtn = this.renderer.getLeaderboardCloseBounds();
      if (this.hitTest(x, y, closeBtn)) {
        this.onCloseLeaderboard();
      }
      return;
    }

    // Game over buttons
    if (this.gameOver) {
      if (this.hitTest(x, y, this.renderer.getPlayAgainBounds())) {
        this.onRestart();
      } else if (this.hitTest(x, y, this.renderer.getLeaderboardBtnBounds())) {
        this.onLeaderboard();
      }
      return;
    }

    // Pick up piece
    const slots = this.renderer.getPieceSlotBounds();
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (this.pieces[i] && this.hitTest(x, y, slot)) {
        this.dragState = {
          pieceIndex: i,
          piece: this.pieces[i]!,
          screenX: x,
          screenY: y,
          gridRow: -1,
          gridCol: -1,
          onGrid: false,
        };
        break;
      }
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragState) return;
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY - this.renderer.layout.cellSize * 2;

    this.dragState.screenX = x;
    this.dragState.screenY = y;

    const bounds = getPieceBounds(this.dragState.piece);
    const centerOffsetX = (bounds.cols * this.renderer.layout.cellSize) / 2;
    const centerOffsetY = (bounds.rows * this.renderer.layout.cellSize) / 2;

    const gridPos = this.renderer.screenToGrid(
      x - centerOffsetX + this.renderer.layout.cellSize / 2,
      y - centerOffsetY + this.renderer.layout.cellSize / 2
    );

    if (gridPos) {
      this.dragState.gridRow = gridPos.row;
      this.dragState.gridCol = gridPos.col;
      this.dragState.onGrid = true;
    } else {
      this.dragState.onGrid = false;
    }
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.dragState) return;
    e.preventDefault();

    if (this.dragState.onGrid) {
      this.onPlace(this.dragState.pieceIndex, this.dragState.gridRow, this.dragState.gridCol);
    }

    this.dragState = null;
  }
}

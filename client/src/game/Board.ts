import { GRID_SIZE } from '../types.ts';
import type { PieceShape } from '../types.ts';

export class Board {
  readonly size = GRID_SIZE;
  grid: number[][]; // 0 = empty, 1-7 = color index

  constructor() {
    this.grid = Array.from({ length: this.size }, () =>
      new Array(this.size).fill(0)
    );
  }

  canPlace(piece: PieceShape, row: number, col: number): boolean {
    for (const [dr, dc] of piece.cells) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= this.size || c < 0 || c >= this.size) return false;
      if (this.grid[r][c] !== 0) return false;
    }
    return true;
  }

  place(piece: PieceShape, row: number, col: number): void {
    for (const [dr, dc] of piece.cells) {
      this.grid[row + dr][col + dc] = piece.color;
    }
  }

  getFullRows(): number[] {
    const rows: number[] = [];
    for (let r = 0; r < this.size; r++) {
      if (this.grid[r].every(cell => cell !== 0)) {
        rows.push(r);
      }
    }
    return rows;
  }

  getFullCols(): number[] {
    const cols: number[] = [];
    for (let c = 0; c < this.size; c++) {
      let full = true;
      for (let r = 0; r < this.size; r++) {
        if (this.grid[r][c] === 0) {
          full = false;
          break;
        }
      }
      if (full) cols.push(c);
    }
    return cols;
  }

  clearLines(rows: number[], cols: number[]): number {
    let cleared = 0;
    for (const r of rows) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] !== 0) cleared++;
        this.grid[r][c] = 0;
      }
    }
    for (const c of cols) {
      for (let r = 0; r < this.size; r++) {
        if (this.grid[r][c] !== 0) cleared++;
        this.grid[r][c] = 0;
      }
    }
    return cleared;
  }

  hasAnyValidPlacement(pieces: PieceShape[]): boolean {
    for (const piece of pieces) {
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.canPlace(piece, r, c)) return true;
        }
      }
    }
    return false;
  }

  reset(): void {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        this.grid[r][c] = 0;
      }
    }
  }
}

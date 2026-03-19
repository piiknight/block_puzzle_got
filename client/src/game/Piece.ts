import type { PieceShape } from '../types.ts';
import type { Board } from './Board.ts';

// All block shapes used in Block Puzzle
const SHAPES: [number, number][][] = [
  // Single
  [[0, 0]],

  // 2-lines
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],

  // 3-lines
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],

  // 4-lines
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],

  // 5-lines
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],

  // 2x2 square
  [[0, 0], [0, 1], [1, 0], [1, 1]],

  // 3x3 square
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],

  // L-shapes (4 rotations)
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 0]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [1, -1]],

  // Big L-shapes
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [2, -1]],
  [[0, 0], [0, 1], [0, 2], [1, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 2]],

  // T-shape
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1]],

  // S/Z shapes
  [[0, 0], [0, 1], [1, 1], [1, 2]],
  [[0, 1], [0, 2], [1, 0], [1, 1]],
];

// Weights: smaller pieces appear more often
const WEIGHTS: number[] = SHAPES.map(s => {
  const size = s.length;
  if (size <= 2) return 3;
  if (size <= 4) return 2;
  return 1;
});

export function randomPiece(): PieceShape {
  const totalWeight = WEIGHTS.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;

  for (let i = 0; i < SHAPES.length; i++) {
    roll -= WEIGHTS[i];
    if (roll <= 0) {
      // Normalize cells so minimum row/col is 0
      const cells = normalizeCells(SHAPES[i]);
      return {
        cells,
        color: Math.floor(Math.random() * 7) + 1,
      };
    }
  }

  return { cells: [[0, 0]], color: 1 };
}

function normalizeCells(cells: [number, number][]): [number, number][] {
  const minR = Math.min(...cells.map(c => c[0]));
  const minC = Math.min(...cells.map(c => c[1]));
  return cells.map(([r, c]) => [r - minR, c - minC]);
}

export function getPieceBounds(piece: PieceShape): { rows: number; cols: number } {
  const maxR = Math.max(...piece.cells.map(c => c[0]));
  const maxC = Math.max(...piece.cells.map(c => c[1]));
  return { rows: maxR + 1, cols: maxC + 1 };
}

export function generatePieces(count: number, board?: Board): PieceShape[] {
  if (!board) return Array.from({ length: count }, () => randomPiece());

  // Try to generate pieces where ALL can be placed sequentially
  for (let attempt = 0; attempt < 50; attempt++) {
    const pieces = Array.from({ length: count }, () => randomPiece());
    if (board.canPlaceAllSequentially(pieces)) return pieces;
  }

  // Fallback: use smaller pieces that are easier to fit
  for (let attempt = 0; attempt < 50; attempt++) {
    const pieces = Array.from({ length: count }, () => randomSmallPiece());
    if (board.canPlaceAllSequentially(pieces)) return pieces;
  }

  // Ultimate fallback: all single cells
  const pieces = Array.from({ length: count }, () => ({
    cells: [[0, 0]] as [number, number][],
    color: Math.floor(Math.random() * 7) + 1,
  }));
  return pieces;
}

function randomSmallPiece(): PieceShape {
  const small: [number, number][][] = [
    [[0, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [1, 0]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0]],
  ];
  const cells = small[Math.floor(Math.random() * small.length)];
  return { cells, color: Math.floor(Math.random() * 7) + 1 };
}

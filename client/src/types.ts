export interface ThemeColors {
  bg: string;
  gridBg: string;
  gridLine: string;
  cellBorder: string;
  text: string;
  textSecondary: string;
  button: string;
}

export interface PieceShape {
  cells: [number, number][];
  color: number;
}

export const CELL_COLORS = [
  '#FF6B6B', // 1 - red
  '#4ECDC4', // 2 - teal
  '#45B7D1', // 3 - blue
  '#96CEB4', // 4 - green
  '#FFEAA7', // 5 - yellow
  '#DDA0DD', // 6 - purple
  '#FF8A5C', // 7 - orange
];

export const GRID_SIZE = 8;

const STORAGE_KEY = 'block_blast_high_score';

export class Score {
  current = 0;
  highScore = 0;
  combo = 0;
  lastClearPoints = 0;

  constructor() {
    this.loadHighScore();
  }

  addPlacement(cellCount: number): void {
    this.current += cellCount * 10;
  }

  addClear(lineCount: number): void {
    if (lineCount === 0) {
      this.combo = 0;
      this.lastClearPoints = 0;
      return;
    }

    this.combo++;
    const basePoints = 100 * lineCount;
    const comboMultiplier = 1 + (this.combo - 1) * 0.5;
    this.lastClearPoints = Math.floor(basePoints * comboMultiplier);
    this.current += this.lastClearPoints;

    if (this.current > this.highScore) {
      this.highScore = this.current;
      this.saveHighScore();
    }
  }

  reset(): void {
    this.current = 0;
    this.combo = 0;
    this.lastClearPoints = 0;
  }

  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch {
      // localStorage not available
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.highScore.toString());
    } catch {
      // localStorage not available
    }
  }
}

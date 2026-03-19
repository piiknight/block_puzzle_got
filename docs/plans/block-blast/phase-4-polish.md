# Phase 4: Polish & Animations

## Tasks

### 4.1 Line Clear Animation
- Flash cleared cells white (2 frames)
- Scale cells down to 0 with ease-out (300ms)
- Particles optional: small squares flying outward

### 4.2 Piece Placement Animation
- Slight bounce/scale effect when piece snaps to grid
- Duration: 150ms ease-out

### 4.3 Score Popup
- "+100" floats up from cleared area
- Combo text "COMBO x2!" center screen, scales up then fades
- Use canvas text rendering, not DOM

### 4.4 Haptic Feedback (Telegram)
```typescript
// telegram.ts
export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error') {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
}

// Usage:
haptic('light');   // piece picked up
haptic('medium');  // piece placed
haptic('heavy');   // line cleared
haptic('success'); // combo
haptic('error');   // game over
```

### 4.5 Game Over Screen
- Darken board overlay
- "GAME OVER" text, center
- Final score + high score
- "Play Again" button
- "Share Score" button (Telegram share)

### 4.6 Visual Polish
- Cell colors: vibrant palette (7 colors)
- Grid background: subtle pattern or gradient
- Smooth drag: piece follows finger at 60fps
- Piece shadow while dragging

## Color Palette
```typescript
const COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#96CEB4', // green
  '#FFEAA7', // yellow
  '#DDA0DD', // purple
  '#FF8A5C', // orange
];
```

## Deliverable
- Smooth animations for all game events
- Haptic feedback integrated
- Game over screen with replay
- Polished visual appearance

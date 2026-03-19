# Phase 2: Block Pieces & Drag-Drop

## Tasks

### 2.1 Piece Definitions
```typescript
interface PieceShape {
  cells: [number, number][]; // relative positions
  color: number;             // color index 1-7
}

// Example shapes
const SHAPES: PieceShape[] = [
  { cells: [[0,0]], color: 1 },                           // single
  { cells: [[0,0],[0,1]], color: 2 },                     // 2-horizontal
  { cells: [[0,0],[1,0]], color: 2 },                     // 2-vertical
  { cells: [[0,0],[0,1],[0,2]], color: 3 },               // 3-horizontal
  { cells: [[0,0],[0,1],[0,2],[0,3]], color: 4 },         // 4-horizontal
  { cells: [[0,0],[0,1],[0,2],[0,3],[0,4]], color: 5 },   // 5-horizontal
  { cells: [[0,0],[0,1],[1,0],[1,1]], color: 6 },         // 2x2 square
  { cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]], color: 7 }, // 3x3
  // L-shapes, T-shapes, S/Z, corners...
];
```

### 2.2 Piece Selection Area
- Render 3 random pieces below the grid
- Scale pieces to fit selection area
- Visual feedback on which piece is selected

### 2.3 Drag & Drop (Pointer Events)
```typescript
class Input {
  private dragging: Piece | null;
  private dragOffset: { x: number, y: number };

  onPointerDown(e: PointerEvent): void;  // Pick up piece
  onPointerMove(e: PointerEvent): void;  // Move with finger
  onPointerUp(e: PointerEvent): void;    // Drop on grid or return
}
```
- Use `pointerdown/move/up` (unified touch + mouse)
- Offset piece above finger so user can see placement
- `touch-action: none` on canvas to prevent scrolling

### 2.4 Ghost Preview
- While dragging over grid, show translucent preview
- Green tint if valid placement, red if invalid
- Snap to nearest grid cell

### 2.5 Placement Validation
- Check `board.canPlace()` for the hovered position
- On valid drop: place piece, remove from selection
- On invalid drop: animate piece back to selection area

## Deliverable
- 3 random pieces shown below grid
- Drag any piece onto grid
- Ghost preview with valid/invalid feedback
- Piece placed on valid drop

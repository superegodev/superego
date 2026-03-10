import type { CanvasColors } from "./types.js";

export default function drawGrid(
  ctx: CanvasRenderingContext2D,
  size: number,
  phase: number,
  colors: CanvasColors,
): void {
  const gridSize = 3;
  const gap = 2;
  const cellSize = Math.floor((size - (gridSize + 1) * gap) / gridSize);
  const offset = Math.floor(
    (size - (gridSize * cellSize + (gridSize + 1) * gap)) / 2,
  );
  const totalCells = gridSize * gridSize;
  const activeIndex = Math.floor(phase * totalCells) % totalCells;
  const activeRow = Math.floor(activeIndex / gridSize);
  const activeCol = activeIndex % gridSize;
  const cellPhase = (phase * totalCells) % 1;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = offset + gap + col * (cellSize + gap);
      const y = offset + gap + row * (cellSize + gap);
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      if (row === activeRow && col === activeCol) {
        ctx.fillStyle = colors.bright;
        ctx.globalAlpha = 0.78 + 0.22 * Math.sin(cellPhase * Math.PI);
        ctx.shadowColor = colors.glowWithAlpha(0.4);
        ctx.shadowBlur = 2;
      } else if (row === activeRow || col === activeCol) {
        ctx.fillStyle = colors.medium;
      } else {
        ctx.fillStyle = colors.dim;
      }
      ctx.fillRect(x, y, cellSize, cellSize);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }
}

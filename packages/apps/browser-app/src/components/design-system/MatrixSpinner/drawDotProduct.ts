import type { CanvasColors } from "./types.js";

export default function drawDotProduct(
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

  const sweepCount = 3;
  const delays = [0, 0.06, 0.11, 0.08, 0.14, 0.19, 0.17, 0.22, 0.28];
  const pulseWidth = 0.18;
  const maxDelay = 0.28;
  const sweepActiveDuration = maxDelay + pulseWidth;
  const trailingGapDuration = sweepActiveDuration;
  const totalDuration = sweepCount * sweepActiveDuration + trailingGapDuration;
  const time = phase * totalDuration;

  const inSweepRegion = time < sweepCount * sweepActiveDuration;
  const localTime = inSweepRegion
    ? time - Math.floor(time / sweepActiveDuration) * sweepActiveDuration
    : -1;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const x = offset + gap + col * (cellSize + gap);
      const y = offset + gap + row * (cellSize + gap);

      // Draw base dim cell.
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.fillStyle = colors.dim;
      ctx.fillRect(x, y, cellSize, cellSize);

      // Overlay bright pulse.
      const delay = delays[index] ?? 0;
      const cellTime = localTime - delay;
      if (cellTime >= 0 && cellTime < pulseWidth) {
        const pulseAmount = Math.sin((cellTime / pulseWidth) * Math.PI);
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
        if (pulseAmount > 0.3) {
          ctx.shadowColor = colors.glowWithAlpha(pulseAmount * 0.5);
          ctx.shadowBlur = 3;
        }
        ctx.globalAlpha = pulseAmount;
        ctx.fillStyle = colors.bright;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }
  }
}

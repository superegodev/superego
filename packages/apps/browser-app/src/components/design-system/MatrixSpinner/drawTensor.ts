import type { CanvasColors } from "./types.js";

export default function drawTensor(
  ctx: CanvasRenderingContext2D,
  size: number,
  phase: number,
  colors: CanvasColors,
): void {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const angle = phase * Math.PI * 2;

  // Plane 1 — rotating on Y axis (horizontal squeeze).
  const scaleX = Math.cos(angle);
  ctx.strokeStyle = colors.medium;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const halfWidth = radius * Math.abs(scaleX);
  ctx.rect(centerX - halfWidth, centerY - radius, halfWidth * 2, radius * 2);
  ctx.stroke();

  // Plane 2 — rotating on X axis (vertical squeeze).
  const scaleY = Math.cos(angle);
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = colors.medium;
  ctx.beginPath();
  const halfHeight = radius * Math.abs(scaleY);
  ctx.rect(centerX - radius, centerY - halfHeight, radius * 2, halfHeight * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Center dot.
  const dotScale = 0.6 + 0.6 * Math.abs(Math.sin(phase * Math.PI));
  const dotAlpha = 0.4 + 0.6 * Math.abs(Math.sin(phase * Math.PI));
  ctx.fillStyle = colors.dim;
  ctx.globalAlpha = dotAlpha;
  ctx.shadowColor = colors.glowWithAlpha(0.3);
  ctx.shadowBlur = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 1.5 * dotScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

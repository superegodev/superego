import type { CanvasColors } from "./types.js";

export default function drawBracket(
  ctx: CanvasRenderingContext2D,
  size: number,
  phase: number,
  colors: CanvasColors,
): void {
  const bracketHeight = size * 0.7;
  const bracketWidth = size * 0.25;
  const centerY = size / 2;
  const lineWidth = 1.2;

  // Bracket positions.
  let leftX: number;
  let rightX: number;
  const progress = phase % 1;
  if (progress < 0.3) {
    const eased = easeInOut(progress / 0.3);
    leftX = eased * (size * 0.2);
    rightX = size - bracketWidth - eased * (size * 0.2);
  } else if (progress < 0.6) {
    leftX = size * 0.2;
    rightX = size - bracketWidth - size * 0.2;
  } else {
    const eased = easeInOut((progress - 0.6) / 0.4);
    leftX = size * 0.2 - eased * (size * 0.2);
    rightX = size - bracketWidth - size * 0.2 + eased * (size * 0.2);
  }

  ctx.strokeStyle = colors.medium;
  ctx.lineWidth = lineWidth;

  // Left bracket [.
  const bracketTop = centerY - bracketHeight / 2;
  const bracketBottom = centerY + bracketHeight / 2;
  ctx.beginPath();
  ctx.moveTo(leftX + bracketWidth, bracketTop);
  ctx.lineTo(leftX + lineWidth, bracketTop);
  ctx.lineTo(leftX + lineWidth, bracketBottom);
  ctx.lineTo(leftX + bracketWidth, bracketBottom);
  ctx.stroke();

  // Right bracket ].
  ctx.beginPath();
  ctx.moveTo(rightX, bracketTop);
  ctx.lineTo(rightX + bracketWidth - lineWidth, bracketTop);
  ctx.lineTo(rightX + bracketWidth - lineWidth, bracketBottom);
  ctx.lineTo(rightX, bracketBottom);
  ctx.stroke();

  // Multiply symbol.
  let multiplyOpacity = 0;
  let multiplyScale = 0.5;
  if (progress > 0.3 && progress < 0.7) {
    const multiplyProgress = (progress - 0.3) / 0.4;
    if (multiplyProgress < 0.3) {
      multiplyOpacity = multiplyProgress / 0.3;
      multiplyScale = 0.5 + 0.5 * (multiplyProgress / 0.3);
    } else if (multiplyProgress < 0.7) {
      multiplyOpacity = 1;
      multiplyScale = 1;
    } else {
      multiplyOpacity = 1 - (multiplyProgress - 0.7) / 0.3;
      multiplyScale = 1 - 0.5 * ((multiplyProgress - 0.7) / 0.3);
    }
  }

  if (multiplyOpacity > 0) {
    ctx.globalAlpha = multiplyOpacity;
    ctx.save();
    ctx.translate(size / 2, centerY);
    ctx.scale(multiplyScale, multiplyScale);
    ctx.strokeStyle = colors.dim;
    ctx.lineWidth = 1.2;
    const crossSize = 3;
    ctx.beginPath();
    ctx.moveTo(-crossSize, -crossSize);
    ctx.lineTo(crossSize, crossSize);
    ctx.moveTo(crossSize, -crossSize);
    ctx.lineTo(-crossSize, crossSize);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function easeInOut(value: number): number {
  return value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
}

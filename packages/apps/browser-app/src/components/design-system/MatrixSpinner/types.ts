export type PhaseType = "Grid" | "DotProduct" | "Bracket" | "Tensor";

export interface Phase {
  type: PhaseType;
  cycles: number;
  cycleDuration: number;
}

export interface TimelineEntry extends Phase {
  start: number;
  duration: number;
}

export interface CanvasColors {
  background: string;
  dim: string;
  medium: string;
  bright: string;
  glowWithAlpha: (alpha: number) => string;
}

export type DrawFunction = (
  ctx: CanvasRenderingContext2D,
  size: number,
  phase: number,
  colors: CanvasColors,
) => void;

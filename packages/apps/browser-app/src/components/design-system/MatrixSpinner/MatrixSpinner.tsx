import { useEffect, useRef } from "react";
import useTheme from "../../../business-logic/theme/useTheme.js";
import { vars } from "../../../themes.css.js";
import drawBracket from "./drawBracket.js";
import drawDotProduct from "./drawDotProduct.js";
import drawGrid from "./drawGrid.js";
import drawTensor from "./drawTensor.js";
import type {
  CanvasColors,
  DrawFunction,
  Phase,
  PhaseType,
  TimelineEntry,
} from "./types.js";

const phases: Phase[] = [
  { type: "Grid", cycles: 2, cycleDuration: 1500 },
  { type: "DotProduct", cycles: 1, cycleDuration: 2300 },
  { type: "Bracket", cycles: 1, cycleDuration: 1500 },
  { type: "Tensor", cycles: 1, cycleDuration: 1500 },
];

const drawers: Record<PhaseType, DrawFunction> = {
  Grid: drawGrid,
  DotProduct: drawDotProduct,
  Bracket: drawBracket,
  Tensor: drawTensor,
};

export default function MatrixSpinner({ size = 20 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  // Theme triggers color re-resolution.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const colors = resolveColors(canvas);

    let startTime: number | null = null;
    let animationFrame: number;

    // Build timeline
    const timeline: TimelineEntry[] = [];
    let totalDuration = 0;
    for (const phaseConfig of phases) {
      const duration = phaseConfig.cycles * phaseConfig.cycleDuration;
      timeline.push({ ...phaseConfig, start: totalDuration, duration });
      totalDuration += duration;
    }

    function draw(timestamp: number) {
      if (startTime === null) {
        startTime = timestamp;
      }
      const elapsed = (timestamp - startTime) % totalDuration;

      // Find active phase
      let active: TimelineEntry = timeline[0]!;
      for (const entry of timeline) {
        if (elapsed >= entry.start && elapsed < entry.start + entry.duration) {
          active = entry;
          break;
        }
      }

      const phaseElapsed = elapsed - active.start;
      const currentPhase =
        (phaseElapsed % active.cycleDuration) / active.cycleDuration;

      ctx!.setTransform(2, 0, 0, 2, 0, 0);
      ctx!.clearRect(0, 0, size, size);
      ctx!.fillStyle = colors.background;
      ctx!.fillRect(0, 0, size, size);

      drawers[active.type](ctx!, size, currentPhase, colors);

      animationFrame = requestAnimationFrame(draw);
    }

    animationFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
    />
  );
}

function resolveColors(element: HTMLElement): CanvasColors {
  element.style.setProperty("--_bg", vars.colors.background.surface);
  element.style.setProperty("--_dim", vars.colors.border.strong);
  element.style.setProperty("--_medium", vars.colors.text.secondary);
  element.style.setProperty("--_bright", vars.colors.text.primary);

  const computed = getComputedStyle(element);
  const background = computed.getPropertyValue("--_bg").trim();
  const dim = computed.getPropertyValue("--_dim").trim();
  const medium = computed.getPropertyValue("--_medium").trim();
  const bright = computed.getPropertyValue("--_bright").trim();

  return {
    background,
    dim,
    medium,
    bright,
    glowWithAlpha: (alpha: number) => withAlpha(bright, alpha),
  };
}

function withAlpha(color: string, alpha: number): string {
  const components = color.match(/\d+/g);
  if (components && components.length >= 3) {
    return `rgba(${components[0]}, ${components[1]}, ${components[2]}, ${alpha})`;
  }
  return color;
}

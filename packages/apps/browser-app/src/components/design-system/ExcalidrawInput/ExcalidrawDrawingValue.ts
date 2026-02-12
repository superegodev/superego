import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

export default interface ExcalidrawDrawingValue {
  elements: NonNullable<ExcalidrawInitialDataState["elements"]>;
  files: NonNullable<ExcalidrawInitialDataState["files"]>;
  appState?: {
    scrollX: number;
    scrollY: number;
    zoom: { value: number };
  };
}

import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

export type ExcalidrawDrawingValue = {
  elements: NonNullable<ExcalidrawInitialDataState["elements"]>;
  files: NonNullable<ExcalidrawInitialDataState["files"]>;
};

export default function excalidrawDrawingJsonObject(): ExcalidrawDrawingValue {
  return {
    elements: [],
    files: {},
  };
}

import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

export type ExcalidrawDrawingValue = {
  elements: NonNullable<ExcalidrawInitialDataState["elements"]>;
  appState: NonNullable<ExcalidrawInitialDataState["appState"]>;
  files: NonNullable<ExcalidrawInitialDataState["files"]>;
};

export default function excalidrawDrawingJsonObject(): ExcalidrawDrawingValue {
  return {
    elements: [],
    appState: {},
    files: {},
  };
}

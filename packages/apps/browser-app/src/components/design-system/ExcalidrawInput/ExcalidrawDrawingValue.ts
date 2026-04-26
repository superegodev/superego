import type {
  AppState,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";

export const PERSISTED_APP_STATE_KEYS = [
  // View
  "scrollX",
  "scrollY",
  "zoom",
  // Tool
  "activeTool",
  "preferredSelectionTool",
  "penMode",
  // Export preferences
  "exportBackground",
  "exportEmbedScene",
  "exportWithDarkMode",
  "exportScale",
  // New-item style
  "currentItemStrokeColor",
  "currentItemBackgroundColor",
  "currentItemFillStyle",
  "currentItemStrokeWidth",
  "currentItemStrokeStyle",
  "currentItemRoughness",
  "currentItemOpacity",
  "currentItemFontFamily",
  "currentItemFontSize",
  "currentItemTextAlign",
  "currentItemStartArrowhead",
  "currentItemEndArrowhead",
  "currentItemRoundness",
  "currentItemArrowType",
  // Canvas
  "viewBackgroundColor",
  // Grid
  "gridSize",
  "gridStep",
  "gridModeEnabled",
  // Snap & binding
  "objectsSnapModeEnabled",
  "isMidpointSnappingEnabled",
  "isBindingEnabled",
  "bindingPreference",
  "bindMode",
  "boxSelectionMode",
  // Sidebar / zen
  "defaultSidebarDockedPreference",
  "zenModeEnabled",
  // Frame rendering
  "frameRendering",
  // Stats panel
  "stats",
] as const satisfies readonly (keyof AppState)[];

export type PersistedExcalidrawAppState = Partial<
  Pick<AppState, (typeof PERSISTED_APP_STATE_KEYS)[number]>
>;

export default interface ExcalidrawDrawingValue {
  elements: NonNullable<ExcalidrawInitialDataState["elements"]>;
  files: NonNullable<ExcalidrawInitialDataState["files"]>;
  appState?: PersistedExcalidrawAppState;
}

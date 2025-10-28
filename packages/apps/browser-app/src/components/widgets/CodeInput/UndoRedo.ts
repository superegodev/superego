import type { RefObject } from "react";

interface UndoRedo {
  setState: (state: { canUndo: boolean; canRedo: boolean }) => void;
  commandsRef: RefObject<UndoRedo.Commands | null>;
}

namespace UndoRedo {
  export interface Commands {
    undo: () => void;
    redo: () => void;
  }
}

export default UndoRedo;

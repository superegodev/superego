import { useMemo, useRef, useState } from "react";
import type UndoRedo from "../UndoRedo.js";

interface UseUndoRedo {
  canUndo: boolean;
  undo: () => void;
  canRedo: boolean;
  redo: () => void;
  /** Prop to pass to the CodeInput component (or a wrapper). */
  prop: UndoRedo;
}
export default function useUndoRedo(): UseUndoRedo {
  const [state, setState] = useState({
    canUndo: false,
    canRedo: false,
  });
  const commandsRef = useRef<UndoRedo.Commands>(null);
  const prop = useMemo<UndoRedo>(() => ({ setState, commandsRef }), []);
  return {
    canUndo: state.canUndo,
    undo: () => commandsRef.current?.undo(),
    canRedo: state.canRedo,
    redo: () => commandsRef.current?.redo(),
    prop,
  };
}

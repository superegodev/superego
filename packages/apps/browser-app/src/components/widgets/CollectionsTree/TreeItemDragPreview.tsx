import type { RefObject } from "react";
import { DragPreview } from "react-aria";
import * as cs from "./CollectionsTree.css.js";

interface Props {
  ref: RefObject<any>;
  name: string;
}
export default function TreeItemDragPreview({ ref, name }: Props) {
  return (
    <DragPreview ref={ref}>
      {() => <div className={cs.TreeItemDragPreview.root}>{name}</div>}
    </DragPreview>
  );
}

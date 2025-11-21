import type { MessageContentPart } from "@superego/backend";
import isEmpty from "../../../../utils/isEmpty.js";
import FilePart from "./FilePart.js";
import * as cs from "./UserMessage.css.js";

interface Props {
  fileParts: MessageContentPart.File[];
}
export default function FileParts({ fileParts }: Props) {
  return !isEmpty(fileParts) ? (
    <div className={cs.FileParts.root}>
      {fileParts.map((filePart, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: order is stable.
        <FilePart key={index} filePart={filePart} />
      ))}
    </div>
  ) : null;
}

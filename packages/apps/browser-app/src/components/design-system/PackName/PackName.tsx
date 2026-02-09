import type { LitePack, Pack } from "@superego/backend";
import * as cs from "./PackName.css.js";

interface Props {
  pack: Pack | LitePack;
}
export default function PackName({ pack }: Props) {
  return (
    <div className={cs.PackName.root}>
      {pack.info.name}{" "}
      <span className={cs.PackName.packId}>
        {pack.id.replace(/^Pack_/, "")}
      </span>
    </div>
  );
}

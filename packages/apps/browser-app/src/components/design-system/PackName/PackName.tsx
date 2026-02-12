import type { LitePack, Pack } from "@superego/backend";
import * as cs from "./PackName.css.js";

interface Props {
  pack: Pack | LitePack;
  showId?: boolean | undefined;
}
export default function PackName({ pack, showId = false }: Props) {
  return (
    <div className={cs.PackName.root}>
      {pack.info.name}{" "}
      {showId ? (
        <span className={cs.PackName.packId}>
          {pack.id.replace(/^Pack_/, "")}
        </span>
      ) : null}
    </div>
  );
}

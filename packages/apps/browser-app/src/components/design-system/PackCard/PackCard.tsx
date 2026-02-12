import type { LitePack } from "@superego/backend";
import { useIntl } from "react-intl";
import type Route from "../../../business-logic/navigation/Route.js";
import Image from "../Image/Image.js";
import Link from "../Link/Link.js";
import PackName from "../PackName/PackName.js";
import * as cs from "./PackCard.css.js";

interface Props {
  pack: LitePack;
  to: Route;
}
export default function PackCard({ pack, to }: Props) {
  const intl = useIntl();
  return (
    <Link to={to} className={cs.PackCard.root}>
      <Image
        image={pack.info.screenshots[0] ?? null}
        alt={intl.formatMessage({ defaultMessage: "Screenshot of the pack" })}
        className={cs.PackCard.screenshot}
      />
      <div className={cs.PackCard.text}>
        <h2 className={cs.PackCard.name}>
          <PackName pack={pack} showId={false} />
        </h2>
        <p className={cs.PackCard.shortDescription}>
          {pack.info.shortDescription}
        </p>
      </div>
    </Link>
  );
}

import { FormattedMessage } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import * as cs from "./Boutique.css.js";

export default function Explainer() {
  return (
    <div className={cs.Explainer.root}>
      <FormattedMessage
        defaultMessage={`
          <p>
            Here in the Boutique you can find pre-made collections and apps,
            bundled into thematic <b>packs</b> you can install in one click.
          </p>
        `}
        values={{
          ...formattedMessageHtmlTags,
        }}
      />
    </div>
  );
}

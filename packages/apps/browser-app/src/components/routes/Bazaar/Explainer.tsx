import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import * as cs from "./Bazaar.css.js";

export default function Explainer() {
  return (
    <div className={cs.Explainer.root}>
      <FormattedMessage
        defaultMessage={`
          <p>
            Here in the Bazaar you can find pre-made collections and apps,
            bundled into thematic <b>packs</b> you can install in one click.
          </p>
          <p>
            You can also use the <cliDocsLink>Superego CLI</cliDocsLink> to
            create your own packs. (Drop below to install.)
          </p>
        `}
        values={{
          ...formattedMessageHtmlTags,
          cliDocsLink: (chunks: ReactNode[]) => (
            <a
              href="https://superego.dev/docs/cli"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </a>
          ),
        }}
      />
    </div>
  );
}

import { FormattedMessage, useIntl } from "react-intl";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./Home.css.js";
import logo from "./logo.avif";

export default function Home() {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Content>
        <div className={cs.Home.root}>
          <img
            src={logo}
            alt={intl.formatMessage({
              defaultMessage:
                "Superego Logo - A low detail, low-poly painting of Freud's face",
            })}
            className={cs.Home.logo}
          />
          <h1 className={cs.Home.title}>
            <FormattedMessage defaultMessage="Superego" />
          </h1>
          <h2 className={cs.Home.tagLine}>
            <FormattedMessage defaultMessage="Your Life's Database" />
          </h2>
        </div>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

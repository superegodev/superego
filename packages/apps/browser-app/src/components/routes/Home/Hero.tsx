import { FormattedMessage, useIntl } from "react-intl";
import * as cs from "./Home.css.js";
import logo from "./logo.avif";

export default function Hero() {
  const intl = useIntl();
  return (
    <div className={cs.Hero.root}>
      <img
        src={logo}
        alt={intl.formatMessage({ defaultMessage: "Superego Logo" })}
        className={cs.Hero.logo}
      />
      <h1 className={cs.Hero.title}>
        <FormattedMessage defaultMessage="Superego" />
      </h1>
      <h2 className={cs.Hero.tagLine}>
        <FormattedMessage defaultMessage="Your Life's Database" />
      </h2>
    </div>
  );
}

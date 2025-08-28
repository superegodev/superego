import { FormattedMessage, useIntl } from "react-intl";
import * as cs from "./Home.css.js";
import logo from "./logo.avif";

interface Props {
  isMinified: boolean;
}
export default function Hero({ isMinified }: Props) {
  const intl = useIntl();
  return (
    <div className={cs.Hero.root[isMinified ? "minified" : "nonMinified"]}>
      <img
        src={logo}
        alt={intl.formatMessage({
          defaultMessage:
            "Superego Logo - A low detail, low-poly painting of Freud's face",
        })}
        className={cs.Hero.logo[isMinified ? "minified" : "nonMinified"]}
      />
      {!isMinified ? (
        <>
          <h1 className={cs.Hero.title}>
            <FormattedMessage defaultMessage="Superego" />
          </h1>
          <h2 className={cs.Hero.tagLine}>
            <FormattedMessage defaultMessage="Your Life's Database" />
          </h2>
        </>
      ) : null}
    </div>
  );
}

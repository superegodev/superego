import { FormattedMessage } from "react-intl";
import Logo from "../../design-system/Logo/Logo.js";
import * as cs from "./Ask.css.js";

export default function Hero() {
  return (
    <div className={cs.Hero.root}>
      <Logo variant="standard" className={cs.Hero.logo} />
      <h1 className={cs.Hero.title}>
        <FormattedMessage defaultMessage="Superego" />
      </h1>
      <p className={cs.Hero.tagLine}>
        <FormattedMessage defaultMessage="Your Life's Database" />
      </p>
    </div>
  );
}

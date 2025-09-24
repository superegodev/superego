import { FormattedMessage } from "react-intl";
import Logo from "../../design-system/Logo/Logo.js";
import * as cs from "./CreateCollectionAssisted.css.js";

export default function Hero() {
  return (
    <div className={cs.Hero.root}>
      <Logo variant="hard-hat" className={cs.Hero.logo} />
      <h1 className={cs.Hero.title}>
        <FormattedMessage defaultMessage="Hello!" />
      </h1>
      <p className={cs.Hero.tagLine}>
        <FormattedMessage defaultMessage="I'm the Collection Creator" />
      </p>
    </div>
  );
}

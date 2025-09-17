import { FormattedMessage } from "react-intl";
import Logo from "../../design-system/Logo/Logo.js";
import * as cs from "./CreateCollectionAssisted.css.js";

export default function Hero() {
  return (
    <div className={cs.Hero.root}>
      <Logo className={cs.Hero.logo} />
      <h1 className={cs.Hero.title}>
        <FormattedMessage defaultMessage="Hello!" />
      </h1>
      <h2 className={cs.Hero.tagLine}>
        <FormattedMessage defaultMessage="I'm the Collection Creator" />
      </h2>
    </div>
  );
}

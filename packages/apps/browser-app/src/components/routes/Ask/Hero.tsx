import { FormattedMessage } from "react-intl";
import classnames from "../../../utils/classnames.js";
import Logo from "../../design-system/Logo/Logo.js";
import * as cs from "./Ask.css.js";

interface Props {
  hasWelcome: boolean;
}
export default function Hero({ hasWelcome }: Props) {
  return (
    <div className={cs.Hero.root}>
      <Logo variant="standard" className={cs.Hero.logo} />
      <h1 className={cs.Hero.title}>
        <FormattedMessage defaultMessage="Superego" />
      </h1>
      <p
        className={classnames(
          cs.Hero.tagLine,
          hasWelcome && cs.Hero.tagLineCompact,
        )}
      >
        <FormattedMessage defaultMessage="Your Digital Freedom" />
      </p>
    </div>
  );
}

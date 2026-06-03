import { RouteName } from "@superego/routing";
import { FormattedMessage, useIntl } from "react-intl";
import Link from "../../design-system/Link/Link.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./NotFound.css.js";

interface Props {
  route: string;
}
export default function NotFound({ route }: Props) {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({ defaultMessage: "Route not found" })}
      />
      <Shell.Panel.Content>
        <div className={cs.NotFound.root}>
          <p className={cs.NotFound.message}>
            <FormattedMessage
              defaultMessage="Route {route} does not exist."
              values={{ route }}
            />
          </p>
          <Link to={{ name: RouteName.Ask }}>
            <FormattedMessage defaultMessage="Home" />
          </Link>
        </div>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

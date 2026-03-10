import type { App } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../design-system/Alert/Alert.js";
import Button from "../../design-system/Button/Button.js";
import Link from "../../design-system/Link/Link.js";
import * as cs from "./AppRenderer.css.js";

interface Props {
  app: App;
  onDismiss: () => void;
}
export default function IncompatibilityWarning({ app, onDismiss }: Props) {
  const intl = useIntl();
  return (
    <Alert
      variant="warning"
      title={intl.formatMessage({
        defaultMessage: "Incompatibility warning",
      })}
      className={cs.IncompatibilityWarning.root}
    >
      <FormattedMessage
        defaultMessage={`
            <p>
              This app might not work correctly, as it uses collections that
              were either changed or deleted since the app was made.
            </p>
            <p>
              Update the app to avoid this warning.
            </p>
          `}
        values={formattedMessageHtmlTags}
      />
      <div className={cs.IncompatibilityWarning.buttons}>
        <Link
          to={{ name: RouteName.EditApp, appId: app.id }}
          className={cs.IncompatibilityWarning.linkButton}
        >
          <Button onPress={(evt) => evt.continuePropagation()}>
            <FormattedMessage defaultMessage="Update the app" />
          </Button>
        </Link>
        <Button onPress={onDismiss}>
          <FormattedMessage defaultMessage="Display anyway" />
        </Button>
      </div>
    </Alert>
  );
}

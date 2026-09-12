import type { ResultError } from "@superego/global-types";
import { useIntl } from "react-intl";
import toTitleCase from "../../../utils/toTitleCase.js";
import Alert from "../Alert/Alert.js";
import CodeBlock from "../CodeBlock/CodeBlock.js";
import Disclosure from "../Disclosure/Disclosure.js";
import * as cs from "./ResultErrors.css.js";

interface Props {
  errors: ResultError<string, any>[];
  /** Disable before global settings are available; CodeBlock needs their theme. */
  highlightDetails?: boolean;
}
export default function ResultErrors({
  errors,
  highlightDetails = true,
}: Props) {
  const intl = useIntl();
  return errors.map((error, index) => (
    // oxlint-disable-next-line react/no-array-index-key -- errors array is stable.
    <Alert key={index} variant="error" title={toTitleCase(error.name)}>
      <Disclosure title={intl.formatMessage({ defaultMessage: "Details" })}>
        {highlightDetails ? (
          <CodeBlock
            language="json"
            code={JSON.stringify(error.details)}
            showCopyButton={true}
          />
        ) : (
          <pre className={cs.ResultErrors.details}>
            {JSON.stringify(error.details, null, 2)}
          </pre>
        )}
      </Disclosure>
    </Alert>
  ));
}

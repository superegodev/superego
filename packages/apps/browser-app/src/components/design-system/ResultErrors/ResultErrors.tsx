import type { ResultError } from "@superego/global-types";
import { useIntl } from "react-intl";
import toTitleCase from "../../../utils/toTitleCase.js";
import Alert from "../Alert/Alert.js";
import CodeBlock from "../CodeBlock/CodeBlock.js";
import Disclosure from "../Disclosure/Disclosure.js";

interface Props {
  errors: ResultError<string, any>[];
}
export default function ResultErrors({ errors }: Props) {
  const intl = useIntl();
  return errors.map((error, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: errors array is stable.
    <Alert key={index} variant="error" title={toTitleCase(error.name)}>
      <Disclosure title={intl.formatMessage({ defaultMessage: "Details" })}>
        <CodeBlock
          language="json"
          code={JSON.stringify(error.details, null, 2)}
          showCopyButton={true}
        />
      </Disclosure>
    </Alert>
  ));
}

import type { DocumentVersion } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import * as cs from "./ContentSummary.css.js";

interface Props {
  contentSummary: DocumentVersion["contentSummary"];
}
export default function ContentSummary({ contentSummary }: Props) {
  if (!contentSummary.success) {
    const { error } = contentSummary;
    return (
      <div className={cs.ContentSummary.root}>
        <FormattedMessage
          defaultMessage="Error deriving content summary: {error}"
          values={{ error: error.name }}
        />
        {error.name === "ExecutingJavascriptFunctionFailed" ? (
          <pre>{error.details.message}</pre>
        ) : null}
      </div>
    );
  }
  return (
    <dl className={cs.ContentSummary.root}>
      {Object.entries(contentSummary.data).map(([name, value]) => (
        <div key={name} className={cs.ContentSummary.property}>
          <dt className={cs.ContentSummary.propertyName}>{name}</dt>
          <dd className={cs.ContentSummary.propertyValue}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

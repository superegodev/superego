import { DocumentVersionCreator } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import * as cs from "./History.css.js";

interface Props {
  createdBy: DocumentVersionCreator;
}
export default function CreatedByLine({ createdBy }: Props) {
  switch (createdBy) {
    case DocumentVersionCreator.User:
      return (
        <div className={cs.CreatedByLine.root}>
          <FormattedMessage defaultMessage="Created by you" />
        </div>
      );
    case DocumentVersionCreator.Connector:
      return (
        <div className={cs.CreatedByLine.root}>
          <FormattedMessage defaultMessage="Created by sync" />
        </div>
      );
    case DocumentVersionCreator.Assistant:
      return (
        <div className={cs.CreatedByLine.root}>
          <FormattedMessage defaultMessage="Created in conversation" />
        </div>
      );
    case DocumentVersionCreator.Migration:
      return (
        <div className={cs.CreatedByLine.root}>
          <FormattedMessage defaultMessage="Created by collection migration" />
        </div>
      );
  }
}

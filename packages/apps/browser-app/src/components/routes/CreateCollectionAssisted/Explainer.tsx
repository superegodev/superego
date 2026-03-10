import { FormattedMessage } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import * as cs from "./CreateCollectionAssisted.css.js";

export default function Explainer() {
  return (
    <div className={cs.Explainer.root}>
      <FormattedMessage
        defaultMessage={`
          <p>
            Your data in Superego is stored in <b>collections</b> of
            <b>documents</b>. Each collection has a <b>schema</b> that defines
            what data each document contains.
          </p>
          <p>
            Example: an <b>Expenses</b> collection contains many <b>Expense</b>
            documents. Each document contains the date of the expense, the
            amount, and a description. (This is the schema.)
          </p>
          <p>
            Just tell the <b>Collection Creator</b> what data you want to store,
            and it will create a collection for you.
          </p>
        `}
        values={formattedMessageHtmlTags}
      />
    </div>
  );
}

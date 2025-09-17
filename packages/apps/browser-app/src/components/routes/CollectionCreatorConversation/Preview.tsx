import type { Conversation } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import CollectionCategoryUtils from "../../../utils/CollectionCategoryUtils.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Button from "../../design-system/Button/Button.jsx";
import * as cs from "./CollectionCreatorConversation.css.js";
import getCollectionSuggestion from "./getCollectionSuggestion.js";
import PreviewDocumentForm from "./PreviewDocumentForm.jsx";

interface Props {
  conversation: Conversation;
}
export default function Preview({ conversation }: Props) {
  const { collectionCategories } = useGlobalData();
  const suggestion = getCollectionSuggestion(conversation);
  if (!suggestion) {
    return null;
  }

  const { settings, schema, exampleDocument } = suggestion;
  const collectionCategory = collectionCategories.find(
    ({ id }) => id === settings.collectionCategoryId,
  )!;

  return (
    <div className={cs.Preview.root}>
      <h4 className={cs.Preview.title}>
        {CollectionCategoryUtils.getDisplayName(collectionCategory)}
        {" » "}
        {CollectionUtils.getDisplayName({ settings })}
      </h4>
      <PreviewDocumentForm schema={schema} exampleDocument={exampleDocument} />
      <Button variant="primary" className={cs.Preview.createButton}>
        <FormattedMessage defaultMessage="Create collection" />
      </Button>
    </div>
  );
}

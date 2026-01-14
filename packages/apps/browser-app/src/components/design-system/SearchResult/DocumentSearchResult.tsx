import type {
  Collection,
  LiteDocument,
  TextSearchResult,
} from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { Fragment } from "react";
import { ListBoxItem, type PressEvent } from "react-aria-components";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import isEmpty from "../../../utils/isEmpty.js";
import ContentSummaryPropertyValue from "../ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import MatchedText from "../MatchedText/MatchedText.js";
import * as cs from "./SearchResult.css.js";

interface Props {
  id?: string;
  result: TextSearchResult<LiteDocument>;
  collection: Collection | null;
  href?: string;
  onPress?: (evt: PressEvent) => void;
}
export default function DocumentSearchResult({
  id,
  result,
  collection,
  href,
  onPress,
}: Props) {
  const { match, matchedText } = result;
  const { contentSummary } = match.latestVersion;

  const documentDisplayName = DocumentUtils.getDisplayName(match);

  const collectionDisplayName = collection
    ? CollectionUtils.getDisplayName(collection)
    : match.collectionId;

  const otherProperties = contentSummary.success
    ? ContentSummaryUtils.getSortedProperties([contentSummary])
        .slice(1)
        .filter(
          (property) =>
            contentSummary.data[property.name] !== null &&
            contentSummary.data[property.name] !== undefined,
        )
        .map((property, index) => (
          <Fragment key={property.name}>
            {index > 0 ? " • " : null}
            {property.label}
            {": "}
            <ContentSummaryPropertyValue
              value={contentSummary.data[property.name]}
            />
          </Fragment>
        ))
    : [];

  return (
    <ListBoxItem
      id={id ?? result.match.id}
      href={href}
      onPress={onPress}
      textValue={documentDisplayName}
      className={cs.SearchResult.root}
    >
      <div className={cs.SearchResult.line1}>
        <span className={cs.SearchResult.displayNameTitle}>
          {documentDisplayName}
        </span>
        <span className={cs.SearchResult.collectionChip}>
          {collectionDisplayName}
        </span>
      </div>
      {!isEmpty(otherProperties) ? (
        <div className={cs.SearchResult.line2}>{otherProperties}</div>
      ) : null}
      <div className={cs.SearchResult.line3}>
        <MatchedText matchedText={matchedText} />
      </div>
    </ListBoxItem>
  );
}

import type { Collection, LiteDocument, TextSearchResult } from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { useMemo } from "react";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import HighlightedText from "../../design-system/HighlightedText/HighlightedText.js";
import Link from "../../design-system/Link/Link.js";
import * as cs from "./SearchModal.css.js";

interface Props {
  result: TextSearchResult<LiteDocument>;
  collection: Collection | null;
  onClick: () => void;
}

export default function SearchResultItem({ result, collection, onClick }: Props) {
  const { match, matchedText } = result;
  const { contentSummary } = match.latestVersion;

  const sortedProperties = useMemo(
    () => ContentSummaryUtils.getSortedProperties([contentSummary]),
    [contentSummary],
  );

  const primaryValue = useMemo(() => {
    const firstProp = sortedProperties[0];
    if (!contentSummary.success || !firstProp) {
      return match.id;
    }
    const value = contentSummary.data[firstProp.name];
    return typeof value === "string" ? value : String(value ?? match.id);
  }, [contentSummary, sortedProperties, match.id]);

  const secondaryValues = useMemo(() => {
    if (!contentSummary.success || sortedProperties.length <= 1) {
      return null;
    }
    const values = sortedProperties
      .slice(1, 4)
      .map((prop) => {
        const value = contentSummary.data[prop.name];
        if (value === null || value === undefined) {
          return null;
        }
        return `${prop.label}: ${typeof value === "boolean" ? (value ? "Yes" : "No") : value}`;
      })
      .filter(Boolean);
    return values.length > 0 ? values.join(" · ") : null;
  }, [contentSummary, sortedProperties]);

  const collectionDisplayName = collection
    ? CollectionUtils.getDisplayName(collection)
    : match.collectionId;

  return (
    <Link
      to={{
        name: RouteName.Document,
        collectionId: match.collectionId,
        documentId: match.id,
      }}
      className={cs.SearchResultItem.root}
      onPress={onClick}
    >
      <div className={cs.SearchResultItem.line1}>
        <span className={cs.SearchResultItem.title}>{primaryValue}</span>
        <span className={cs.SearchResultItem.collectionChip}>{collectionDisplayName}</span>
      </div>
      {secondaryValues ? <div className={cs.SearchResultItem.line2}>{secondaryValues}</div> : null}
      {matchedText ? (
        <div className={cs.SearchResultItem.line3}>
          <HighlightedText text={matchedText} />
        </div>
      ) : null}
    </Link>
  );
}

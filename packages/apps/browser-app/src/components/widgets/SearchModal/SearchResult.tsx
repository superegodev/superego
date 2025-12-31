import type {
  Collection,
  LiteDocument,
  TextSearchResult,
} from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { useMemo } from "react";
import { ListBoxItem } from "react-aria-components";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import MatchedText from "../../design-system/MatchedText/MatchedText.js";
import * as cs from "./SearchModal.css.js";

interface Props {
  result: TextSearchResult<LiteDocument>;
  collection: Collection | null;
}
export default function SearchResult({ result, collection }: Props) {
  const { match, matchedText } = result;
  const { contentSummary } = match.latestVersion;

  const displayName = DocumentUtils.getDisplayName(match);

  const otherProperties = useMemo(() => {
    const sortedProperties = ContentSummaryUtils.getSortedProperties([
      contentSummary,
    ]);
    if (!contentSummary.success || sortedProperties.length <= 1) {
      return null;
    }
    const segments = sortedProperties
      .slice(1)
      .map((prop) =>
        contentSummary.data[prop.name]
          ? `${prop.label}: ${contentSummary.data[prop.name]}`
          : null,
      )
      .filter(Boolean);
    return segments.length > 0 ? segments.join(" • ") : null;
  }, [contentSummary]);

  const collectionDisplayName = collection
    ? CollectionUtils.getDisplayName(collection)
    : match.collectionId;

  const href = toHref({
    name: RouteName.Document,
    collectionId: match.collectionId,
    documentId: match.id,
  });

  return (
    <ListBoxItem
      id={result.match.id}
      href={href}
      textValue={displayName}
      className={cs.SearchResult.root}
    >
      <div className={cs.SearchResult.line1}>
        <span className={cs.SearchResult.documentDisplayName}>
          {displayName}
        </span>
        <span className={cs.SearchResult.collectionChip}>
          {collectionDisplayName}
        </span>
      </div>
      {otherProperties ? (
        <div className={cs.SearchResult.line2}>{otherProperties}</div>
      ) : null}
      <div className={cs.SearchResult.line3}>
        <MatchedText matchedText={matchedText} />
      </div>
    </ListBoxItem>
  );
}

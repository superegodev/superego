import type { CollectionId, LiteDocument } from "@superego/backend";
import type { ContentSummaryUtils } from "@superego/shared-utils";
import { FormattedDate, FormattedMessage } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import isEmpty from "../../../utils/isEmpty.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import Table from "../../design-system/Table/Table.js";

interface Props {
  collectionId: CollectionId;
  document: LiteDocument;
  sortedProperties: ReturnType<typeof ContentSummaryUtils.getSortedProperties>;
  showCreatedAt: boolean | undefined;
  showLastModifiedAt: boolean | undefined;
  screenSize: ScreenSize;
}
export default function DocumentTableRow({
  collectionId,
  document,
  sortedProperties,
  showCreatedAt,
  showLastModifiedAt,
  screenSize,
}: Props) {
  return (
    <Table.Row
      href={toHref({
        name: RouteName.Document,
        collectionId: collectionId,
        documentId: document.id,
        documentVersionId: document.latestVersion.id,
        redirectIfLatest: true,
      })}
    >
      {isEmpty(sortedProperties) ? (
        <Table.Cell>{document.id}</Table.Cell>
      ) : null}
      {sortedProperties.map(({ name }) => (
        <Table.Cell key={name}>
          {document.latestVersion.contentSummary.success ? (
            <ContentSummaryPropertyValue
              value={document.latestVersion.contentSummary.data[name]}
            />
          ) : document.latestVersion.contentSummary.error.name ===
            "ContentSummaryNotValid" ? (
            <FormattedMessage defaultMessage="Invalid content summary" />
          ) : (
            document.latestVersion.contentSummary.error.details.message
          )}
        </Table.Cell>
      ))}
      {showCreatedAt && screenSize > ScreenSize.Medium ? (
        <Table.Cell>
          <FormattedDate
            value={document.createdAt}
            dateStyle="short"
            timeStyle="short"
          />
        </Table.Cell>
      ) : null}
      {showLastModifiedAt && screenSize > ScreenSize.Medium ? (
        <Table.Cell>
          <FormattedDate
            value={document.latestVersion.createdAt}
            dateStyle="short"
            timeStyle="short"
          />
        </Table.Cell>
      ) : null}
    </Table.Row>
  );
}

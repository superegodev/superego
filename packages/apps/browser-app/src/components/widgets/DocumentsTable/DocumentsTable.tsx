import type { Collection, Document } from "@superego/backend";
import { uniq } from "es-toolkit";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import isEmpty from "../../../utils/isEmpty.js";
import Table from "../../design-system/Table/Table.js";

interface Props {
  collection: Collection;
  documents: Document[];
}
export default function DocumentsTable({ collection, documents }: Props) {
  const intl = useIntl();
  const contentSummaryKeys = uniq(
    documents.flatMap((document) =>
      Object.keys(document.latestVersion.contentSummary.data ?? {}),
    ),
  ).sort();
  return (
    <Table
      aria-label={intl.formatMessage(
        { defaultMessage: "Documents of collection {collection}" },
        { collection: collection.settings.name },
      )}
      selectionMode="none"
    >
      <Table.Header>
        {isEmpty(contentSummaryKeys) ? (
          <Table.Column isRowHeader={true}>
            <FormattedMessage defaultMessage="Id" />
          </Table.Column>
        ) : null}
        {contentSummaryKeys.map((contentSummaryKey, index) => (
          <Table.Column key={contentSummaryKey} isRowHeader={index === 0}>
            {DocumentUtils.formatContentSummaryKey(contentSummaryKey)}
          </Table.Column>
        ))}
        <Table.Column align="right">
          <FormattedMessage defaultMessage="Created at" />
        </Table.Column>
        <Table.Column align="right">
          <FormattedMessage defaultMessage="Last modified at" />
        </Table.Column>
      </Table.Header>
      <Table.Body
        items={documents}
        renderEmptyState={() => (
          <Table.Empty>
            <FormattedMessage defaultMessage="This collection doesn't have any documents yet." />
          </Table.Empty>
        )}
      >
        {(document) => (
          <Table.Row
            href={toHref({
              name: RouteName.Document,
              collectionId: collection.id,
              documentId: document.id,
            })}
          >
            {isEmpty(contentSummaryKeys) ? (
              <Table.Cell>{document.id}</Table.Cell>
            ) : null}
            {contentSummaryKeys.map((key) => (
              <Table.Cell key={key}>
                {document.latestVersion.contentSummary.success ? (
                  document.latestVersion.contentSummary.data[key]
                ) : document.latestVersion.contentSummary.error.name ===
                  "ContentSummaryNotValid" ? (
                  <FormattedMessage defaultMessage="Invalid content summary" />
                ) : (
                  document.latestVersion.contentSummary.error.details.message
                )}
              </Table.Cell>
            ))}
            <Table.Cell align="right">
              <FormattedDate value={document.createdAt} />
            </Table.Cell>
            <Table.Cell align="right">
              <FormattedDate value={document.latestVersion.createdAt} />
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}

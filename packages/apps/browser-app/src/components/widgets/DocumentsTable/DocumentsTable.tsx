import type { Collection, Document } from "@superego/backend";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import Table from "../../design-system/Table/Table.js";

interface Props {
  collection: Collection;
  documents: Document[];
}
export default function DocumentsTable({ collection, documents }: Props) {
  const intl = useIntl();
  return (
    <Table
      aria-label={intl.formatMessage(
        { defaultMessage: "Documents of collection {collection}" },
        { collection: collection.settings.name },
      )}
      selectionMode="none"
    >
      <Table.Header>
        {collection.latestVersion.settings.summaryProperties.map(
          ({ name }, index) => (
            <Table.Column key={name} isRowHeader={index === 0}>
              {name}
            </Table.Column>
          ),
        )}
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
            {document.latestVersion.summaryProperties.map(
              ({ name, value, valueComputationError }) => (
                <Table.Cell key={name}>
                  {value ?? valueComputationError.details.message}
                </Table.Cell>
              ),
            )}
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

import {
  ButtonLink,
  Link,
  SimpleMonthCalendar,
  Table,
  Text,
} from "@superego/app-sandbox/components";
import React from "react";
import type * as ProtoCollection_1 from "./ProtoCollection_1.js";

interface Props {
  collections: {
    /**
     * "Calendar" collection.
     */
    ProtoCollection_1: {
      id: "ProtoCollection_1";
      versionId: string;
      displayName: string;
      documents: {
        id: string;
        versionId: string;
        href: string;
        content: ProtoCollection_1.CalendarEntry;
      }[];
    };
  };
}

type CalendarDocument = Props["collections"]["ProtoCollection_1"]["documents"][number];

const COLLECTION_ID = "ProtoCollection_1";

function getLocalDayKey(instant: string): string {
  const date = new Date(instant);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(instant: string): string {
  return new Date(instant).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEndTime(instant: string | null): string {
  return instant === null ? "-" : formatTime(instant);
}

function sortByStartTime(documents: CalendarDocument[]): CalendarDocument[] {
  return [...documents].sort(
    (left, right) =>
      new Date(left.content.startTime).getTime() -
      new Date(right.content.startTime).getTime(),
  );
}

function groupByDay(documents: CalendarDocument[]): Map<string, CalendarDocument[]> {
  const documentsByDay = new Map<string, CalendarDocument[]>();

  for (const document of sortByStartTime(documents)) {
    const dayKey = getLocalDayKey(document.content.startTime);
    const current = documentsByDay.get(dayKey) ?? [];
    current.push(document);
    documentsByDay.set(dayKey, current);
  }

  return documentsByDay;
}

export default function App(props: Props): React.ReactElement {
  const documents = props.collections.ProtoCollection_1.documents;
  const documentsByDay = React.useMemo(() => groupByDay(documents), [documents]);
  const createNewHref = `/collections/${COLLECTION_ID}/documents/new`;
  const rowLinkStyle: React.CSSProperties = React.useMemo(
    () => ({
      display: "block",
      textDecoration: "none",
      color: "inherit",
      margin: "-0.5rem",
      padding: "0.5rem",
    }),
    [],
  );

  const renderDayCell = React.useCallback(
    (day: string): React.ReactElement => {
      const dayDocuments = documentsByDay.get(day) ?? [];
      if (dayDocuments.length === 0) {
        return (
          <SimpleMonthCalendar.DayCell>
            <div style={{ height: "100%" }} />
          </SimpleMonthCalendar.DayCell>
        );
      }

      const visibleDocuments =
        dayDocuments.length <= 3 ? dayDocuments : dayDocuments.slice(0, 2);
      const hiddenCount = dayDocuments.length - visibleDocuments.length;

      return (
        <SimpleMonthCalendar.DayCell>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              height: "100%",
              justifyContent: "center",
            }}
          >
            {visibleDocuments.map((document) => (
              <div
                key={document.id}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.125rem 0.375rem",
                  backgroundColor: "#f9fafb",
                }}
              >
                <Text
                  element="span"
                  size="xs"
                  style={{
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                  }}
                >
                  {formatTime(document.content.startTime)} {document.content.title}
                </Text>
              </div>
            ))}
            {hiddenCount > 0 ? (
              <Text
                element="span"
                size="xs"
                color="secondary"
                style={{
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                and {hiddenCount} more events
              </Text>
            ) : null}
          </div>
        </SimpleMonthCalendar.DayCell>
      );
    },
    [documentsByDay],
  );

  const renderDayPopover = React.useCallback(
    (day: string): React.ReactElement => {
      const dayDocuments = documentsByDay.get(day) ?? [];

      return (
        <SimpleMonthCalendar.DayPopover>
          {dayDocuments.length === 0 ? (
            <Text element="p" size="sm" color="secondary">
              No events on this day.
            </Text>
          ) : (
            <Table ariaLabel="Events for selected day">
              <Table.Header>
                <Table.Column isRowHeader={true}>Start</Table.Column>
                <Table.Column>End</Table.Column>
                <Table.Column>Title</Table.Column>
              </Table.Header>
              <Table.Body>
                {dayDocuments.map((document) => (
                  <Table.Row key={document.id}>
                    <Table.Cell>
                      <Link href={document.href} target="_top" style={rowLinkStyle}>
                        {formatTime(document.content.startTime)}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={document.href} target="_top" style={rowLinkStyle}>
                        {formatEndTime(document.content.endTime)}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={document.href} target="_top" style={rowLinkStyle}>
                        {document.content.title}
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <ButtonLink href={createNewHref} size="sm" target="_top">
              Create new
            </ButtonLink>
          </div>
        </SimpleMonthCalendar.DayPopover>
      );
    },
    [createNewHref, documentsByDay, rowLinkStyle],
  );

  return (
    <SimpleMonthCalendar
      firstDayOfWeek="mon"
      renderDayCell={renderDayCell}
      renderDayPopover={renderDayPopover}
    />
  );
}

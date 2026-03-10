import { ButtonLink, Link, SimpleMonthCalendar, Table, Text, } from "@superego/app-sandbox/components";
import React from "react";
const COLLECTION_ID = "ProtoCollection_1";
function getLocalDayKey(instant) {
    const date = new Date(instant);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function formatTime(instant) {
    return new Date(instant).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
}
function formatEndTime(instant) {
    return instant === null ? "-" : formatTime(instant);
}
function sortByStartTime(documents) {
    return [...documents].sort((left, right) => new Date(left.content.startTime).getTime() -
        new Date(right.content.startTime).getTime());
}
function groupByDay(documents) {
    const documentsByDay = new Map();
    for (const document of sortByStartTime(documents)) {
        const dayKey = getLocalDayKey(document.content.startTime);
        const current = documentsByDay.get(dayKey) ?? [];
        current.push(document);
        documentsByDay.set(dayKey, current);
    }
    return documentsByDay;
}
export default function App(props) {
    const documents = props.collections.ProtoCollection_1.documents;
    const documentsByDay = React.useMemo(() => groupByDay(documents), [documents]);
    const createNewHref = `/collections/${COLLECTION_ID}/documents/new`;
    const rowLinkStyle = React.useMemo(() => ({
        display: "block",
        textDecoration: "none",
        color: "inherit",
        margin: "-0.5rem",
        padding: "0.5rem",
    }), []);
    const renderDayCell = React.useCallback((day) => {
        const dayDocuments = documentsByDay.get(day) ?? [];
        if (dayDocuments.length === 0) {
            return (React.createElement(SimpleMonthCalendar.DayCell, null,
                React.createElement("div", { style: { height: "100%" } })));
        }
        const visibleDocuments = dayDocuments.length <= 3 ? dayDocuments : dayDocuments.slice(0, 2);
        const hiddenCount = dayDocuments.length - visibleDocuments.length;
        return (React.createElement(SimpleMonthCalendar.DayCell, null,
            React.createElement("div", { style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    height: "100%",
                    justifyContent: "center",
                } },
                visibleDocuments.map((document) => (React.createElement("div", { key: document.id, style: {
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        padding: "0.125rem 0.375rem",
                        backgroundColor: "#f9fafb",
                    } },
                    React.createElement(Text, { element: "span", size: "xs", style: {
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.2,
                        } },
                        formatTime(document.content.startTime),
                        " ",
                        document.content.title)))),
                hiddenCount > 0 ? (React.createElement(Text, { element: "span", size: "xs", color: "secondary", style: {
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    } },
                    "and ",
                    hiddenCount,
                    " more events")) : null)));
    }, [documentsByDay]);
    const renderDayPopover = React.useCallback((day) => {
        const dayDocuments = documentsByDay.get(day) ?? [];
        return (React.createElement(SimpleMonthCalendar.DayPopover, null,
            dayDocuments.length === 0 ? (React.createElement(Text, { element: "p", size: "sm", color: "secondary" }, "No events on this day.")) : (React.createElement(Table, { ariaLabel: "Events for selected day" },
                React.createElement(Table.Header, null,
                    React.createElement(Table.Column, { isRowHeader: true }, "Start"),
                    React.createElement(Table.Column, null, "End"),
                    React.createElement(Table.Column, null, "Title")),
                React.createElement(Table.Body, null, dayDocuments.map((document) => (React.createElement(Table.Row, { key: document.id },
                    React.createElement(Table.Cell, null,
                        React.createElement(Link, { href: document.href, target: "_top", style: rowLinkStyle }, formatTime(document.content.startTime))),
                    React.createElement(Table.Cell, null,
                        React.createElement(Link, { href: document.href, target: "_top", style: rowLinkStyle }, formatEndTime(document.content.endTime))),
                    React.createElement(Table.Cell, null,
                        React.createElement(Link, { href: document.href, target: "_top", style: rowLinkStyle }, document.content.title)))))))),
            React.createElement("div", { style: {
                    marginTop: "0.75rem",
                    display: "flex",
                    justifyContent: "flex-end",
                } },
                React.createElement(ButtonLink, { href: createNewHref, size: "sm", target: "_top" }, "Create new"))));
    }, [createNewHref, documentsByDay, rowLinkStyle]);
    return (React.createElement(SimpleMonthCalendar, { firstDayOfWeek: "mon", renderDayCell: renderDayCell, renderDayPopover: renderDayPopover }));
}

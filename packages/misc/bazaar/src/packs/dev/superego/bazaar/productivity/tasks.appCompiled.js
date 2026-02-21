import React from "react";
import { KanbanBoard, Text, IconButton, ToggleButton, PlainDateRangePicker, } from "@superego/app-sandbox/components";
import { useCreateDocument, useCreateNewDocumentVersion, useDeleteDocument, } from "@superego/app-sandbox/hooks";
import theme from "@superego/app-sandbox/theme";
const STAGES = ["Backlog", "Scheduled", "Doing", "Done"];
const STAGE_COLORS = {
    Backlog: theme.colors.blues._4,
    Scheduled: theme.colors.yellows._4,
    Doing: theme.colors.oranges._4,
    Done: theme.colors.greens._4,
};
function parseSubtasks(markdown) {
    const checkboxRegex = /^[\s]*[-*]\s+\[([ xX])\]/gm;
    let total = 0;
    let done = 0;
    let match;
    while ((match = checkboxRegex.exec(markdown)) !== null) {
        total++;
        if (match[1] !== " ")
            done++;
    }
    return total > 0 ? { done, total } : null;
}
function getDueDateColor(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + "T00:00:00");
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)
        return theme.colors.reds._4;
    if (diffDays <= 2)
        return theme.colors.oranges._4;
    return theme.colors.text.secondary;
}
function formatDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
export default function App(props) {
    const collection = props.collections.ProtoCollection_2;
    const documents = collection.documents;
    const [dueDateRange, setDueDateRange] = React.useState(null);
    const [showBacklog, setShowBacklog] = React.useState(true);
    const [showArchived, setShowArchived] = React.useState(false);
    const createDocument = useCreateDocument();
    const createVersion = useCreateNewDocumentVersion();
    const deleteDocument = useDeleteDocument();
    const filteredDocs = documents.filter((doc) => {
        if (!showArchived && doc.content.archived)
            return false;
        if (!showBacklog && doc.content.stage === "Backlog")
            return false;
        if (dueDateRange) {
            if (!doc.content.dueDate)
                return false;
            if (doc.content.dueDate < dueDateRange.start ||
                doc.content.dueDate > dueDateRange.end)
                return false;
        }
        return true;
    });
    const docsByStage = {
        Backlog: [],
        Scheduled: [],
        Doing: [],
        Done: [],
    };
    for (const doc of filteredDocs) {
        docsByStage[doc.content.stage].push(doc);
    }
    for (const stage of STAGES) {
        docsByStage[stage].sort((a, b) => a.content.priority - b.content.priority);
    }
    function handleCardMoved(event) {
        const cardId = String(event.cardId);
        const toStage = String(event.toColumnId);
        const doc = documents.find((d) => d.id === cardId);
        if (!doc)
            return;
        const targetDocs = docsByStage[toStage].filter((d) => d.id !== cardId);
        let newPriority;
        if (event.target.type === "root") {
            newPriority =
                targetDocs.length > 0
                    ? targetDocs[targetDocs.length - 1].content.priority + 1
                    : 0;
        }
        else {
            const targetKey = String(event.target.key);
            const targetIndex = targetDocs.findIndex((d) => d.id === targetKey);
            if (targetIndex === -1) {
                newPriority =
                    targetDocs.length > 0
                        ? targetDocs[targetDocs.length - 1].content.priority + 1
                        : 0;
            }
            else if (event.target.dropPosition === "before") {
                if (targetIndex === 0) {
                    newPriority = targetDocs[0].content.priority - 1;
                }
                else {
                    newPriority =
                        (targetDocs[targetIndex - 1].content.priority +
                            targetDocs[targetIndex].content.priority) /
                            2;
                }
            }
            else {
                if (targetIndex === targetDocs.length - 1) {
                    newPriority = targetDocs[targetIndex].content.priority + 1;
                }
                else {
                    newPriority =
                        (targetDocs[targetIndex].content.priority +
                            targetDocs[targetIndex + 1].content.priority) /
                            2;
                }
            }
        }
        createVersion.mutate("ProtoCollection_2", doc.id, doc.versionId, {
            ...doc.content,
            stage: toStage,
            priority: newPriority,
        });
    }
    function handleAddTask(stage) {
        const stageDocs = docsByStage[stage];
        const maxPriority = stageDocs.length > 0
            ? Math.max(...stageDocs.map((d) => d.content.priority))
            : -1;
        createDocument.mutate({
            collectionId: "ProtoCollection_2",
            content: {
                title: "New task",
                description: null,
                stage,
                dueDate: null,
                priority: maxPriority + 1,
                archived: false,
            },
        });
    }
    function handleArchive(doc) {
        createVersion.mutate("ProtoCollection_2", doc.id, doc.versionId, {
            ...doc.content,
            archived: !doc.content.archived,
        });
    }
    function handleDelete(doc) {
        deleteDocument.mutate("ProtoCollection_2", doc.id);
    }
    const visibleStages = showBacklog
        ? STAGES
        : STAGES.filter((s) => s !== "Backlog");
    return (React.createElement("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing._4,
            height: "100%",
        } },
        React.createElement("div", { style: {
                display: "flex",
                alignItems: "center",
                gap: theme.spacing._4,
            } },
            React.createElement("div", { style: { width: "24rem" } },
                React.createElement(PlainDateRangePicker, { value: dueDateRange, onChange: setDueDateRange, layout: "horizontal", label: "Due date" })),
            React.createElement("div", { style: { display: "flex", gap: "0.5rem", marginLeft: "auto" } },
                React.createElement(ToggleButton, { value: showBacklog, onChange: setShowBacklog }, "Backlog"),
                React.createElement(ToggleButton, { value: showArchived, onChange: setShowArchived }, "Archived"))),
        React.createElement(KanbanBoard, { onCardMoved: handleCardMoved }, visibleStages.map((stage) => (React.createElement(KanbanBoard.Column, { key: stage, id: stage, ariaLabel: stage, title: React.createElement("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                } },
                React.createElement("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    } },
                    React.createElement("span", { style: {
                            display: "inline-block",
                            width: "0.5rem",
                            height: "0.5rem",
                            borderRadius: "50%",
                            backgroundColor: STAGE_COLORS[stage],
                        } }),
                    React.createElement(Text, { weight: "semibold", size: "sm" }, stage),
                    React.createElement(Text, { color: "secondary", size: "xs" }, docsByStage[stage].length)),
                React.createElement(IconButton, { icon: "plus", label: `Add task to ${stage}`, variant: "invisible", size: "sm", onPress: () => handleAddTask(stage) })) }, docsByStage[stage].map((doc) => (React.createElement(KanbanBoard.Card, { key: doc.id, id: doc.id, textValue: doc.content.title, href: doc.href },
            React.createElement("div", { style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    opacity: doc.content.archived ? 0.5 : 1,
                } },
                React.createElement(Text, { weight: "semibold", size: "sm" }, doc.content.title),
                React.createElement("div", { style: { minHeight: "1.25rem" } }, doc.content.dueDate ? (React.createElement(Text, { size: "xs", style: {
                        color: getDueDateColor(doc.content.dueDate),
                    } },
                    "Due date: ",
                    formatDate(doc.content.dueDate))) : null),
                React.createElement("div", { style: { minHeight: "1.25rem" } }, (() => {
                    const subtasks = parseSubtasks(doc.content.description);
                    return subtasks ? (React.createElement(Text, { size: "xs", color: "secondary" },
                        "Subtasks: ",
                        subtasks.done,
                        "/",
                        subtasks.total)) : null;
                })()),
                React.createElement("div", { style: {
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.25rem",
                    }, onClick: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation() },
                    React.createElement(IconButton, { icon: "archive", label: doc.content.archived ? "Unarchive" : "Archive", variant: "invisible", size: "sm", onPress: () => handleArchive(doc) }),
                    React.createElement(IconButton, { icon: "trash", label: "Delete", variant: "invisible", size: "sm", onPress: () => handleDelete(doc) }))))))))))));
}

import { LocalInstant } from "@superego/javascript-sandbox-global-utils";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { DataType, FormatId, type Schema } from "@superego/schema";
import { expect, it } from "vitest";
import makeContentSummaryGetter from "./makeContentSummaryGetter.js";

it("generates the correct contentSummaryGetter for the tableColumns", async () => {
  // Exercise
  const schema: Schema = {
    types: {
      Type: {
        description: "Type of contact.",
        dataType: DataType.Enum,
        members: {
          Person: { value: "Person" },
          Organization: { value: "Organization" },
        },
      },
      Name: {
        dataType: DataType.Struct,
        properties: {
          first: { dataType: DataType.String },
          last: { dataType: DataType.String },
        },
      },
      Phone: {
        dataType: DataType.Struct,
        properties: {
          number: { dataType: DataType.String },
        },
      },
      Contact: {
        dataType: DataType.Struct,
        properties: {
          type: { dataType: null, ref: "Type" },
          name: { dataType: null, ref: "Name" },
          age: { dataType: DataType.Number },
          favorite: { dataType: DataType.Boolean },
          isFamily: { dataType: DataType.Boolean },
          lastTalkedAt: {
            dataType: DataType.String,
            format: FormatId.String.Instant,
          },
          phones: {
            dataType: DataType.List,
            items: { dataType: null, ref: "Phone" },
          },
          friendGroups: {
            dataType: DataType.List,
            items: {
              dataType: DataType.List,
              items: {
                dataType: DataType.String,
              },
            },
          },
        },
      },
    },
    rootType: "Contact",
  };
  const tableColumns: { header: string; path: string }[] = [
    // Simple cases
    { header: "Type", path: "type" },
    { header: "First Name", path: "name.first" },
    { header: "Age", path: "age" },
    { header: "Favorite", path: "favorite" },
    { header: "Is Family", path: "isFamily" },
    { header: "Last Talked At", path: "lastTalkedAt" },
    { header: "Main Phone", path: "phones.0.number" },
    { header: "Best Friend", path: "friendGroups.0.0" },
    { header: "Second Best Friend", path: "friendGroups.0.1" },
    // Odd cases
    { header: '"Header "with" quotes"', path: "type" },
    { header: "1Header starting with a number", path: "type" },
    { header: "%Header with odd chars (case 1)", path: "type" },
    { header: "`Header with odd chars (case 2)", path: "type" },
    { header: "[] syntax (case 1)", path: "phones[0].number" },
    { header: "[] syntax (case 2)", path: 'name["first"]' },
    { header: "[] syntax (case 3)", path: "name[first]" },
    { header: "Nested [] syntax (case 1)", path: "friendGroups[0][0]" },
    { header: "Nested [] syntax (case 2)", path: "phones[0][number]" },
    { header: "Nested [] syntax (case 3)", path: 'phones[0]["number"]' },
  ];
  const exampleDocumentContent = {
    type: "Person",
    name: {
      first: "Bernhard",
      last: "Riemann",
    },
    age: 199,
    favorite: true,
    isFamily: false,
    lastTalkedAt: "2025-09-18T11:14:00.000+03:00",
    phones: [{ number: "+1200000000000" }],
    friendGroups: [["Abel"]],
  };
  const contentSummaryGetter = makeContentSummaryGetter(schema, tableColumns);
  const contentSummaryResult =
    await new QuickjsJavascriptSandbox().executeSyncFunction(
      contentSummaryGetter,
      [exampleDocumentContent],
    );

  // Verify
  expect(contentSummaryGetter.source).toMatchInlineSnapshot(`
    "import type { Contact } from "./CollectionSchema.js";

    export default function getContentSummary(
      contact: Contact
    ): Record<string, string> {
      return {
        "{position:0,sortable:true,default-sort:asc} Type": contact?.type ?? "",
        "{position:1,sortable:true,default-sort:null} First Name": contact?.name?.first ?? "",
        "{position:2,sortable:true,default-sort:null} Age": (contact?.age !== undefined ? String(contact?.age) : "") ?? "",
        "{position:3,sortable:true,default-sort:null} Favorite": (contact?.favorite !== undefined ? (contact?.favorite ? "✔": "✖") : "") ?? "",
        "{position:4,sortable:true,default-sort:null} Is Family": (contact?.isFamily !== undefined ? (contact?.isFamily ? "✔": "✖") : "") ?? "",
        "{position:5,sortable:true,default-sort:null} Last Talked At": (contact?.lastTalkedAt !== undefined ? LocalInstant.fromISO(contact?.lastTalkedAt).toFormat() : "") ?? "",
        "{position:6,sortable:true,default-sort:null} Main Phone": contact?.phones?.[0]?.number ?? "",
        "{position:7,sortable:true,default-sort:null} Best Friend": contact?.friendGroups?.[0]?.[0] ?? "",
        "{position:8,sortable:true,default-sort:null} Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? "",
        "{position:9,sortable:true,default-sort:null} \\"Header \\"with\\" quotes\\"": contact?.type ?? "",
        "{position:10,sortable:true,default-sort:null} 1Header starting with a number": contact?.type ?? "",
        "{position:11,sortable:true,default-sort:null} %Header with odd chars (case 1)": contact?.type ?? "",
        "{position:12,sortable:true,default-sort:null} \`Header with odd chars (case 2)": contact?.type ?? "",
        "{position:13,sortable:true,default-sort:null} [] syntax (case 1)": contact?.phones?.[0]?.number ?? "",
        "{position:14,sortable:true,default-sort:null} [] syntax (case 2)": contact?.name?.first ?? "",
        "{position:15,sortable:true,default-sort:null} [] syntax (case 3)": contact?.name?.first ?? "",
        "{position:16,sortable:true,default-sort:null} Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? "",
        "{position:17,sortable:true,default-sort:null} Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? "",
        "{position:18,sortable:true,default-sort:null} Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? "",
      };
    }"
  `);
  expect(contentSummaryGetter.compiled).toMatchInlineSnapshot(`
    "export default function getContentSummary(contact) {
      return {
        "{position:0,sortable:true,default-sort:asc} Type": contact?.type ?? "",
        "{position:1,sortable:true,default-sort:null} First Name": contact?.name?.first ?? "",
        "{position:2,sortable:true,default-sort:null} Age": (contact?.age !== undefined ? String(contact?.age) : "") ?? "",
        "{position:3,sortable:true,default-sort:null} Favorite": (contact?.favorite !== undefined ? (contact?.favorite ? "✔": "✖") : "") ?? "",
        "{position:4,sortable:true,default-sort:null} Is Family": (contact?.isFamily !== undefined ? (contact?.isFamily ? "✔": "✖") : "") ?? "",
        "{position:5,sortable:true,default-sort:null} Last Talked At": (contact?.lastTalkedAt !== undefined ? LocalInstant.fromISO(contact?.lastTalkedAt).toFormat() : "") ?? "",
        "{position:6,sortable:true,default-sort:null} Main Phone": contact?.phones?.[0]?.number ?? "",
        "{position:7,sortable:true,default-sort:null} Best Friend": contact?.friendGroups?.[0]?.[0] ?? "",
        "{position:8,sortable:true,default-sort:null} Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? "",
        "{position:9,sortable:true,default-sort:null} \\"Header \\"with\\" quotes\\"": contact?.type ?? "",
        "{position:10,sortable:true,default-sort:null} 1Header starting with a number": contact?.type ?? "",
        "{position:11,sortable:true,default-sort:null} %Header with odd chars (case 1)": contact?.type ?? "",
        "{position:12,sortable:true,default-sort:null} \`Header with odd chars (case 2)": contact?.type ?? "",
        "{position:13,sortable:true,default-sort:null} [] syntax (case 1)": contact?.phones?.[0]?.number ?? "",
        "{position:14,sortable:true,default-sort:null} [] syntax (case 2)": contact?.name?.first ?? "",
        "{position:15,sortable:true,default-sort:null} [] syntax (case 3)": contact?.name?.first ?? "",
        "{position:16,sortable:true,default-sort:null} Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? "",
        "{position:17,sortable:true,default-sort:null} Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? "",
        "{position:18,sortable:true,default-sort:null} Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? "",
      };
    }"
  `);
  expect(contentSummaryResult).toEqual({
    data: {
      "{position:0,sortable:true,default-sort:asc} Type": "Person",
      "{position:1,sortable:true,default-sort:null} First Name": "Bernhard",
      "{position:2,sortable:true,default-sort:null} Age": "199",
      "{position:3,sortable:true,default-sort:null} Favorite": "✔",
      "{position:4,sortable:true,default-sort:null} Is Family": "✖",
      "{position:5,sortable:true,default-sort:null} Last Talked At":
        LocalInstant.fromISO(exampleDocumentContent.lastTalkedAt).toFormat(),
      "{position:6,sortable:true,default-sort:null} Main Phone":
        "+1200000000000",
      "{position:7,sortable:true,default-sort:null} Best Friend": "Abel",
      "{position:8,sortable:true,default-sort:null} Second Best Friend": "",
      '{position:9,sortable:true,default-sort:null} "Header "with" quotes"':
        "Person",
      "{position:10,sortable:true,default-sort:null} 1Header starting with a number":
        "Person",
      "{position:11,sortable:true,default-sort:null} %Header with odd chars (case 1)":
        "Person",
      "{position:12,sortable:true,default-sort:null} `Header with odd chars (case 2)":
        "Person",
      "{position:13,sortable:true,default-sort:null} [] syntax (case 1)":
        "+1200000000000",
      "{position:14,sortable:true,default-sort:null} [] syntax (case 2)":
        "Bernhard",
      "{position:15,sortable:true,default-sort:null} [] syntax (case 3)":
        "Bernhard",
      "{position:16,sortable:true,default-sort:null} Nested [] syntax (case 1)":
        "Abel",
      "{position:17,sortable:true,default-sort:null} Nested [] syntax (case 2)":
        "+1200000000000",
      "{position:18,sortable:true,default-sort:null} Nested [] syntax (case 3)":
        "+1200000000000",
    },
    error: null,
    success: true,
  });
});

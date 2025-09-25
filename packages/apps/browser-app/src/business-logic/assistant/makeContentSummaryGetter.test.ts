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
          birthDate: {
            dataType: DataType.String,
            format: FormatId.String.PlainDate,
          },
          favorite: { dataType: DataType.Boolean },
          erdosNumber: { dataType: DataType.Number },
          publishedPapers: { dataType: DataType.Number },
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
        nullableProperties: ["erdosNumber"],
      },
    },
    rootType: "Contact",
  };
  const tableColumns: { header: string; path: string }[] = [
    // Simple cases
    { header: "Type", path: "type" },
    { header: "First Name", path: "name.first" },
    { header: "Birth Date", path: "birthDate" },
    { header: "Favorite", path: "favorite" },
    { header: "Erdős Number", path: "erdosNumber" },
    { header: "Published Papers", path: "publishedPapers" },
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
    birthDate: "1826-09-17",
    favorite: true,
    erdosNumber: null,
    publishedPapers: 11,
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
    ): Record<string, string | number | boolean | null> {
      return {
        "{position:0,sortable:true,default-sort:asc} Type": contact?.type ?? null,
        "{position:1,sortable:true} First Name": contact?.name?.first ?? null,
        "{position:2,sortable:true} Birth Date": contact?.birthDate ?? null,
        "{position:3,sortable:true} Favorite": contact?.favorite ?? null,
        "{position:4,sortable:true} Erdős Number": contact?.erdosNumber ?? null,
        "{position:5,sortable:true} Published Papers": contact?.publishedPapers ?? null,
        "{position:6,sortable:true} Is Family": contact?.isFamily ?? null,
        "{position:7,sortable:true} Last Talked At": contact?.lastTalkedAt ?? null,
        "{position:8,sortable:true} Main Phone": contact?.phones?.[0]?.number ?? null,
        "{position:9,sortable:true} Best Friend": contact?.friendGroups?.[0]?.[0] ?? null,
        "{position:10,sortable:true} Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? null,
        "{position:11,sortable:true} \\"Header \\"with\\" quotes\\"": contact?.type ?? null,
        "{position:12,sortable:true} 1Header starting with a number": contact?.type ?? null,
        "{position:13,sortable:true} %Header with odd chars (case 1)": contact?.type ?? null,
        "{position:14,sortable:true} \`Header with odd chars (case 2)": contact?.type ?? null,
        "{position:15,sortable:true} [] syntax (case 1)": contact?.phones?.[0]?.number ?? null,
        "{position:16,sortable:true} [] syntax (case 2)": contact?.name?.first ?? null,
        "{position:17,sortable:true} [] syntax (case 3)": contact?.name?.first ?? null,
        "{position:18,sortable:true} Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? null,
        "{position:19,sortable:true} Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? null,
        "{position:20,sortable:true} Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? null,
      };
    }"
  `);
  expect(contentSummaryGetter.compiled).toMatchInlineSnapshot(`
    "export default function getContentSummary(contact) {
      return {
        "{position:0,sortable:true,default-sort:asc} Type": contact?.type ?? null,
        "{position:1,sortable:true} First Name": contact?.name?.first ?? null,
        "{position:2,sortable:true} Birth Date": contact?.birthDate ?? null,
        "{position:3,sortable:true} Favorite": contact?.favorite ?? null,
        "{position:4,sortable:true} Erdős Number": contact?.erdosNumber ?? null,
        "{position:5,sortable:true} Published Papers": contact?.publishedPapers ?? null,
        "{position:6,sortable:true} Is Family": contact?.isFamily ?? null,
        "{position:7,sortable:true} Last Talked At": contact?.lastTalkedAt ?? null,
        "{position:8,sortable:true} Main Phone": contact?.phones?.[0]?.number ?? null,
        "{position:9,sortable:true} Best Friend": contact?.friendGroups?.[0]?.[0] ?? null,
        "{position:10,sortable:true} Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? null,
        "{position:11,sortable:true} \\"Header \\"with\\" quotes\\"": contact?.type ?? null,
        "{position:12,sortable:true} 1Header starting with a number": contact?.type ?? null,
        "{position:13,sortable:true} %Header with odd chars (case 1)": contact?.type ?? null,
        "{position:14,sortable:true} \`Header with odd chars (case 2)": contact?.type ?? null,
        "{position:15,sortable:true} [] syntax (case 1)": contact?.phones?.[0]?.number ?? null,
        "{position:16,sortable:true} [] syntax (case 2)": contact?.name?.first ?? null,
        "{position:17,sortable:true} [] syntax (case 3)": contact?.name?.first ?? null,
        "{position:18,sortable:true} Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? null,
        "{position:19,sortable:true} Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? null,
        "{position:20,sortable:true} Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? null,
      };
    }"
  `);
  expect(contentSummaryResult).toEqual({
    data: {
      "{position:0,sortable:true,default-sort:asc} Type": "Person",
      "{position:1,sortable:true} First Name": "Bernhard",
      "{position:2,sortable:true} Birth Date": "1826-09-17",
      "{position:3,sortable:true} Favorite": true,
      "{position:4,sortable:true} Erdős Number": null,
      "{position:5,sortable:true} Published Papers": 11,
      "{position:6,sortable:true} Is Family": false,
      "{position:7,sortable:true} Last Talked At":
        exampleDocumentContent.lastTalkedAt,
      "{position:8,sortable:true} Main Phone": "+1200000000000",
      "{position:9,sortable:true} Best Friend": "Abel",
      "{position:10,sortable:true} Second Best Friend": null,
      '{position:11,sortable:true} "Header "with" quotes"': "Person",
      "{position:12,sortable:true} 1Header starting with a number": "Person",
      "{position:13,sortable:true} %Header with odd chars (case 1)": "Person",
      "{position:14,sortable:true} `Header with odd chars (case 2)": "Person",
      "{position:15,sortable:true} [] syntax (case 1)": "+1200000000000",
      "{position:16,sortable:true} [] syntax (case 2)": "Bernhard",
      "{position:17,sortable:true} [] syntax (case 3)": "Bernhard",
      "{position:18,sortable:true} Nested [] syntax (case 1)": "Abel",
      "{position:19,sortable:true} Nested [] syntax (case 2)": "+1200000000000",
      "{position:20,sortable:true} Nested [] syntax (case 3)": "+1200000000000",
    },
    error: null,
    success: true,
  });
});

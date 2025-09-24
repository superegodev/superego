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
        "0. Type": contact?.type ?? "",
        "1. First Name": contact?.name?.first ?? "",
        "2. Age": (contact?.age !== undefined ? String(contact?.age) : "") ?? "",
        "3. Favorite": (contact?.favorite !== undefined ? (contact?.favorite ? "✔": "✖") : "") ?? "",
        "4. Is Family": (contact?.isFamily !== undefined ? (contact?.isFamily ? "✔": "✖") : "") ?? "",
        "5. Last Talked At": (contact?.lastTalkedAt !== undefined ? LocalInstant.fromISO(contact?.lastTalkedAt).toFormat() : "") ?? "",
        "6. Main Phone": contact?.phones?.[0]?.number ?? "",
        "7. Best Friend": contact?.friendGroups?.[0]?.[0] ?? "",
        "8. Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? "",
        "9. \\"Header \\"with\\" quotes\\"": contact?.type ?? "",
        "10. 1Header starting with a number": contact?.type ?? "",
        "11. %Header with odd chars (case 1)": contact?.type ?? "",
        "12. \`Header with odd chars (case 2)": contact?.type ?? "",
        "13. [] syntax (case 1)": contact?.phones?.[0]?.number ?? "",
        "14. [] syntax (case 2)": contact?.name?.first ?? "",
        "15. [] syntax (case 3)": contact?.name?.first ?? "",
        "16. Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? "",
        "17. Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? "",
        "18. Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? "",
      };
    }"
  `);
  expect(contentSummaryGetter.compiled).toMatchInlineSnapshot(`
    "export default function getContentSummary(contact) {
      return {
        "0. Type": contact?.type ?? "",
        "1. First Name": contact?.name?.first ?? "",
        "2. Age": (contact?.age !== undefined ? String(contact?.age) : "") ?? "",
        "3. Favorite": (contact?.favorite !== undefined ? (contact?.favorite ? "✔": "✖") : "") ?? "",
        "4. Is Family": (contact?.isFamily !== undefined ? (contact?.isFamily ? "✔": "✖") : "") ?? "",
        "5. Last Talked At": (contact?.lastTalkedAt !== undefined ? LocalInstant.fromISO(contact?.lastTalkedAt).toFormat() : "") ?? "",
        "6. Main Phone": contact?.phones?.[0]?.number ?? "",
        "7. Best Friend": contact?.friendGroups?.[0]?.[0] ?? "",
        "8. Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? "",
        "9. \\"Header \\"with\\" quotes\\"": contact?.type ?? "",
        "10. 1Header starting with a number": contact?.type ?? "",
        "11. %Header with odd chars (case 1)": contact?.type ?? "",
        "12. \`Header with odd chars (case 2)": contact?.type ?? "",
        "13. [] syntax (case 1)": contact?.phones?.[0]?.number ?? "",
        "14. [] syntax (case 2)": contact?.name?.first ?? "",
        "15. [] syntax (case 3)": contact?.name?.first ?? "",
        "16. Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? "",
        "17. Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? "",
        "18. Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? "",
      };
    }"
  `);
  expect(contentSummaryResult).toEqual({
    data: {
      "0. Type": "Person",
      "1. First Name": "Bernhard",
      "2. Age": "199",
      "3. Favorite": "✔",
      "4. Is Family": "✖",
      "5. Last Talked At": LocalInstant.fromISO(
        exampleDocumentContent.lastTalkedAt,
      ).toFormat(),
      "6. Main Phone": "+1200000000000",
      "7. Best Friend": "Abel",
      "8. Second Best Friend": "",
      '9. "Header "with" quotes"': "Person",
      "10. 1Header starting with a number": "Person",
      "11. %Header with odd chars (case 1)": "Person",
      "12. `Header with odd chars (case 2)": "Person",
      "13. [] syntax (case 1)": "+1200000000000",
      "14. [] syntax (case 2)": "Bernhard",
      "15. [] syntax (case 3)": "Bernhard",
      "16. Nested [] syntax (case 1)": "Abel",
      "17. Nested [] syntax (case 2)": "+1200000000000",
      "18. Nested [] syntax (case 3)": "+1200000000000",
    },
    error: null,
    success: true,
  });
});

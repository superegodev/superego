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
        "Type": contact?.type ?? "",
        "First Name": contact?.name?.first ?? "",
        "Age": String(contact?.age) ?? "",
        "Favorite": String(contact?.favorite) ?? "",
        "Last Talked At": LocalInstant.fromISO(contact?.lastTalkedAt).toFormat() ?? "",
        "Main Phone": contact?.phones?.[0]?.number ?? "",
        "Best Friend": contact?.friendGroups?.[0]?.[0] ?? "",
        "Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? "",
        "\\"Header \\"with\\" quotes\\"": contact?.type ?? "",
        "1Header starting with a number": contact?.type ?? "",
        "%Header with odd chars (case 1)": contact?.type ?? "",
        "\`Header with odd chars (case 2)": contact?.type ?? "",
        "[] syntax (case 1)": contact?.phones?.[0]?.number ?? "",
        "[] syntax (case 2)": contact?.name?.first ?? "",
        "[] syntax (case 3)": contact?.name?.first ?? "",
        "Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? "",
        "Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? "",
        "Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? "",
      };
    }"
  `);
  expect(contentSummaryGetter.compiled).toMatchInlineSnapshot(`
    "export default function getContentSummary(contact) {
      return {
        "Type": contact?.type ?? "",
        "First Name": contact?.name?.first ?? "",
        "Age": String(contact?.age) ?? "",
        "Favorite": String(contact?.favorite) ?? "",
        "Last Talked At": LocalInstant.fromISO(contact?.lastTalkedAt).toFormat() ?? "",
        "Main Phone": contact?.phones?.[0]?.number ?? "",
        "Best Friend": contact?.friendGroups?.[0]?.[0] ?? "",
        "Second Best Friend": contact?.friendGroups?.[0]?.[1] ?? "",
        "\\"Header \\"with\\" quotes\\"": contact?.type ?? "",
        "1Header starting with a number": contact?.type ?? "",
        "%Header with odd chars (case 1)": contact?.type ?? "",
        "\`Header with odd chars (case 2)": contact?.type ?? "",
        "[] syntax (case 1)": contact?.phones?.[0]?.number ?? "",
        "[] syntax (case 2)": contact?.name?.first ?? "",
        "[] syntax (case 3)": contact?.name?.first ?? "",
        "Nested [] syntax (case 1)": contact?.friendGroups?.[0]?.[0] ?? "",
        "Nested [] syntax (case 2)": contact?.phones?.[0]?.number ?? "",
        "Nested [] syntax (case 3)": contact?.phones?.[0]?.number ?? "",
      };
    }"
  `);
  expect(contentSummaryResult).toEqual({
    data: {
      Type: "Person",
      "First Name": "Bernhard",
      Age: "199",
      Favorite: "true",
      "Last Talked At": LocalInstant.fromISO(
        exampleDocumentContent.lastTalkedAt,
      ).toFormat(),
      "Main Phone": "+1200000000000",
      "Best Friend": "Abel",
      "Second Best Friend": "",
      '"Header "with" quotes"': "Person",
      "1Header starting with a number": "Person",
      "%Header with odd chars (case 1)": "Person",
      "`Header with odd chars (case 2)": "Person",
      "[] syntax (case 1)": "+1200000000000",
      "[] syntax (case 2)": "Bernhard",
      "[] syntax (case 3)": "Bernhard",
      "Nested [] syntax (case 1)": "Abel",
      "Nested [] syntax (case 2)": "+1200000000000",
      "Nested [] syntax (case 3)": "+1200000000000",
    },
    error: null,
    success: true,
  });
});

import type { DocumentVersion } from "@superego/backend";
import { describe, expect, it } from "vitest";
import type ContentSummaryProperty from "./ContentSummaryProperty.js";
import ContentSummaryUtils from "./ContentSummaryUtils.js";

describe("parsePropertyName", () => {
  describe("parses the property name into a ContentSummaryProperty object", () => {
    const testCases: {
      name: string;
      propertyName: string;
      expectedResult: ContentSummaryProperty;
    }[] = [
      //////////////////////
      // Valid attributes //
      //////////////////////
      {
        name: "no attributes",
        propertyName: "Name",
        expectedResult: {
          name: "Name",
          label: "Name",
          position: 999,
          sortable: false,
          defaultSort: null,
        },
      },
      {
        name: "only position specified",
        propertyName: "{position:0} Name",
        expectedResult: {
          name: "{position:0} Name",
          label: "Name",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
      },
      {
        name: "only sortable specified",
        propertyName: "{sortable:true} Name",
        expectedResult: {
          name: "{sortable:true} Name",
          label: "Name",
          position: 999,
          sortable: true,
          defaultSort: null,
        },
      },
      {
        name: "no space between prefix and name",
        propertyName: "{position:0,sortable:true}Name",
        expectedResult: {
          name: "{position:0,sortable:true}Name",
          label: "Name",
          position: 0,
          sortable: true,
          defaultSort: null,
        },
      },
      {
        name: "position with more than one digit",
        propertyName: "{position:10} Name",
        expectedResult: {
          name: "{position:10} Name",
          label: "Name",
          position: 10,
          sortable: false,
          defaultSort: null,
        },
      },
      {
        name: "bracketed string outside prefix (case 1)",
        propertyName: "{position:0} Name {sortable:true}",
        expectedResult: {
          name: "{position:0} Name {sortable:true}",
          label: "Name {sortable:true}",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
      },
      {
        name: "bracketed string outside prefix (case 2)",
        propertyName: "{position:0} {sortable:true}Name",
        expectedResult: {
          name: "{position:0} {sortable:true}Name",
          label: "{sortable:true}Name",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
      },
      {
        name: "position and sortable specified",
        propertyName: "{position:0,sortable:true} Name",
        expectedResult: {
          name: "{position:0,sortable:true} Name",
          label: "Name",
          position: 0,
          sortable: true,
          defaultSort: null,
        },
      },
      {
        name: "position and sortable specified in different order",
        propertyName: "{sortable:true,position:0} Name",
        expectedResult: {
          name: "{sortable:true,position:0} Name",
          label: "Name",
          position: 0,
          sortable: true,
          defaultSort: null,
        },
      },
      {
        name: "all attributes specified",
        propertyName: "{position:0,sortable:true,default-sort:asc} Name",
        expectedResult: {
          name: "{position:0,sortable:true,default-sort:asc} Name",
          label: "Name",
          position: 0,
          sortable: true,
          defaultSort: "asc",
        },
      },
      // Invalid attributes -> preserves property name.
      {
        name: "non-existing attributes",
        propertyName: "{position:0,nonExisting:true} Name",
        expectedResult: {
          name: "{position:0,nonExisting:true} Name",
          label: "{position:0,nonExisting:true} Name",
          position: 999,
          sortable: false,
          defaultSort: null,
        },
      },
      {
        name: "incorrect attribute values",
        propertyName: "{position:0,sortable:true,default-sort:1} Name",
        expectedResult: {
          name: "{position:0,sortable:true,default-sort:1} Name",
          label: "{position:0,sortable:true,default-sort:1} Name",
          position: 999,
          sortable: false,
          defaultSort: null,
        },
      },
      {
        name: "invalid attribute syntax",
        propertyName: "{position:0,sortable} Name",
        expectedResult: {
          name: "{position:0,sortable} Name",
          label: "{position:0,sortable} Name",
          position: 999,
          sortable: false,
          defaultSort: null,
        },
      },
    ];
    it.each(testCases)(
      "case: $propertyName",
      ({ propertyName, expectedResult }) => {
        // Exercise
        const actualResult =
          ContentSummaryUtils.parsePropertyName(propertyName);

        // Verify
        expect(actualResult).toEqual(expectedResult);
      },
    );
  });
});

describe("getSortedProperties", () => {
  describe("gets the sorted properties of a list of LiteDocuments", () => {
    it("case: empty list", () => {
      // Exercise
      const sortedProperties = ContentSummaryUtils.getSortedProperties([]);

      // Verify
      expect(sortedProperties).toEqual([]);
    });

    it("case: content summaries with same properties", () => {
      // Exercise
      const contentSummaries: DocumentVersion["contentSummary"][] = [
        {
          success: true,
          data: {
            "{position:0} First Name": "First Name 1",
            "{position:1} Last Name": "Last Name 1",
          },
          error: null,
        },
        {
          success: true,
          data: {
            "{position:0} First Name": "First Name 2",
            "{position:1} Last Name": "Last Name 2",
          },
          error: null,
        },
      ];
      const sortedProperties =
        ContentSummaryUtils.getSortedProperties(contentSummaries);

      // Verify
      expect(sortedProperties).toEqual([
        {
          name: "{position:0} First Name",
          label: "First Name",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
        {
          name: "{position:1} Last Name",
          label: "Last Name",
          position: 1,
          sortable: false,
          defaultSort: null,
        },
      ]);
    });

    it("case: content summaries with different properties", () => {
      // Exercise
      const contentSummaries: DocumentVersion["contentSummary"][] = [
        {
          success: true,
          data: {
            "{position:0} First Name": "First Name",
          },
          error: null,
        },
        {
          success: true,
          data: {
            "{position:1} Last Name": "Last Name",
          },
          error: null,
        },
      ];
      const sortedProperties =
        ContentSummaryUtils.getSortedProperties(contentSummaries);

      // Verify
      expect(sortedProperties).toEqual([
        {
          name: "{position:0} First Name",
          label: "First Name",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
        {
          name: "{position:1} Last Name",
          label: "Last Name",
          position: 1,
          sortable: false,
          defaultSort: null,
        },
      ]);
    });

    it("case: content summaries with conflicting properties", () => {
      // Exercise
      const contentSummaries: DocumentVersion["contentSummary"][] = [
        {
          success: true,
          data: {
            "{position:0} First Name": "First Name",
          },
          error: null,
        },
        {
          success: true,
          data: {
            "{position:0} Last Name": "Last Name",
          },
          error: null,
        },
      ];
      const sortedProperties = ContentSummaryUtils.getSortedProperties(
        contentSummaries as any,
      );

      // Verify
      expect(sortedProperties).toEqual([
        {
          name: "{position:0} First Name",
          label: "First Name",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
        {
          name: "{position:0} Last Name",
          label: "Last Name",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
      ]);
    });

    it("case: some content summaries with an error", () => {
      // Exercise
      const contentSummaries: DocumentVersion["contentSummary"][] = [
        {
          success: true,
          data: {
            "{position:0} First Name": "First Name 1",
            "{position:1} Last Name": "Last Name 1",
          },
          error: null,
        },
        {
          success: false,
          data: null,
          error: {} as any,
        },
      ];
      const sortedProperties =
        ContentSummaryUtils.getSortedProperties(contentSummaries);

      // Verify
      expect(sortedProperties).toEqual([
        {
          name: "{position:0} First Name",
          label: "First Name",
          position: 0,
          sortable: false,
          defaultSort: null,
        },
        {
          name: "{position:1} Last Name",
          label: "Last Name",
          position: 1,
          sortable: false,
          defaultSort: null,
        },
      ]);
    });
  });
});

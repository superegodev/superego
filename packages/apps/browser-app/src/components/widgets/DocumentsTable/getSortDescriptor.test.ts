import type { ContentSummaryProperty } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import getSortDescriptor from "./getSortDescriptor.js";
import type { SortableColumnIds } from "./useSortableColumnIds.js";

describe("returns the first sortable property with a default sort, when there is one", () => {
  it("case: first property has default sort", () => {
    // Exercise
    const properties: ContentSummaryProperty[] = [
      {
        name: "0",
        label: "0",
        position: 0,
        sortable: true,
        defaultSort: "asc",
      },
      {
        name: "1",
        label: "1",
        position: 1,
        sortable: true,
        defaultSort: null,
      },
    ];
    const sortableColumnIds: SortableColumnIds = {
      propertyPrefix: "propertyPrefix",
      createdAt: "createdAt",
      lastModifiedAt: "lastModifiedAt",
    };
    const sortDescriptor = getSortDescriptor(properties, sortableColumnIds);

    // Verify
    expect(sortDescriptor).toEqual({
      column: "propertyPrefix0",
      direction: "ascending",
    });
  });

  it("case: first property is sortable but has no default sort", () => {
    // Exercise
    const properties: ContentSummaryProperty[] = [
      {
        name: "0",
        label: "0",
        position: 0,
        sortable: true,
        defaultSort: null,
      },
      {
        name: "1",
        label: "1",
        position: 1,
        sortable: true,
        defaultSort: "asc",
      },
    ];
    const sortableColumnIds: SortableColumnIds = {
      propertyPrefix: "propertyPrefix",
      createdAt: "createdAt",
      lastModifiedAt: "lastModifiedAt",
    };
    const sortDescriptor = getSortDescriptor(properties, sortableColumnIds);

    // Verify
    expect(sortDescriptor).toEqual({
      column: "propertyPrefix1",
      direction: "ascending",
    });
  });
});

it("returns the first sortable property, if there is one and there are no properties with a default sort", () => {
  // Exercise
  const properties: ContentSummaryProperty[] = [
    {
      name: "0",
      label: "0",
      position: 0,
      sortable: false,
      defaultSort: null,
    },
    {
      name: "1",
      label: "1",
      position: 1,
      sortable: true,
      defaultSort: null,
    },
    {
      name: "2",
      label: "2",
      position: 2,
      sortable: true,
      defaultSort: null,
    },
  ];
  const sortableColumnIds: SortableColumnIds = {
    propertyPrefix: "propertyPrefix",
    createdAt: "createdAt",
    lastModifiedAt: "lastModifiedAt",
  };
  const sortDescriptor = getSortDescriptor(properties, sortableColumnIds);

  // Verify
  expect(sortDescriptor).toEqual({
    column: "propertyPrefix1",
    direction: "ascending",
  });
});

it("returns the fallback sort descriptor for lastModifiedAt if there are no sortable properties", () => {
  // Exercise
  const properties: ContentSummaryProperty[] = [
    {
      name: "0",
      label: "0",
      position: 0,
      sortable: false,
      defaultSort: null,
    },
  ];
  const sortableColumnIds: SortableColumnIds = {
    propertyPrefix: "propertyPrefix",
    createdAt: "createdAt",
    lastModifiedAt: "lastModifiedAt",
  };
  const sortDescriptor = getSortDescriptor(properties, sortableColumnIds);

  // Verify
  expect(sortDescriptor).toEqual({
    column: "lastModifiedAt",
    direction: "descending",
  });
});

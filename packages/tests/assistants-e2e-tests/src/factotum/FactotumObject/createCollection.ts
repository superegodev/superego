import type { Backend, Collection, Document } from "@superego/backend";
import type { Schema } from "@superego/schema";
import pMap from "p-map";
import assertSuccessfulResult from "../../utils/assertSuccessfulResult.js";

export interface CollectionDefinition {
  name: string;
  description?: string | null;
  assistantInstructions?: string | null;
  schema: Schema;
  documentContents: object[];
}

export default async function createCollection(
  backend: Backend,
  definition: CollectionDefinition,
): Promise<{ collection: Collection; documents: Document[] }> {
  const createCollectionResult = await backend.collections.create(
    {
      name: definition.name,
      icon: null,
      collectionCategoryId: null,
      description: definition.description ?? null,
      assistantInstructions: definition.assistantInstructions ?? null,
    },
    definition.schema,
    {
      summaryProperties: [
        {
          name: "name",
          getter: {
            source: 'export default function getValue() { return ""; }',
            compiled: 'export default function getValue() { return ""; }',
          },
        },
      ],
    },
  );
  assertSuccessfulResult(
    `Error creating collection ${definition.name}`,
    createCollectionResult,
  );
  const { data: collection } = createCollectionResult;

  const documents = await pMap(
    definition.documentContents,
    async (documentContent, index) => {
      const createDocumentResult = await backend.documents.create(
        collection.id,
        documentContent,
      );
      assertSuccessfulResult(
        `Error creating document ${index} in collection ${definition.name}`,
        createDocumentResult,
      );
      return createDocumentResult.data;
    },
  );

  return { collection, documents };
}

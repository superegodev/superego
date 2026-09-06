import { DataType } from "@superego/schema";
import type Data from "../Data.js";

export default function migrateAppState(data: Data) {
  for (const app of Object.values(data.apps)) {
    app.state = app.state
      ? { content: app.state.content, revision: app.state.revision }
      : { content: {}, revision: 1 };
  }
  for (const version of Object.values(data.appVersions)) {
    const legacyVersion = version as unknown as Record<string, unknown>;
    delete legacyVersion["stateSchemaId"];
    version.permissions = {
      modals: version.permissions?.modals ?? false,
      downloads: version.permissions?.downloads ?? false,
      http: version.permissions?.http ?? { allowedOrigins: [] },
    };
    version.stateDefinition ??= legacyVersion[
      "state"
    ] as typeof version.stateDefinition;
    delete legacyVersion["state"];
    version.stateDefinition ??= {
      schema: {
        types: { State: { dataType: DataType.Struct, properties: {} } },
        rootType: "State",
      },
      initialState: {},
      migration: null,
    };
    version.stateDefinition.migration ??= null;
  }
}

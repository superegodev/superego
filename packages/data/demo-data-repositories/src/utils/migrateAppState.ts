import { DataType } from "@superego/schema";
import type Data from "../Data.js";

export default function migrateAppState(data: Data) {
  for (const app of Object.values(data.apps)) {
    app.state = app.state
      ? { content: app.state.content, revision: app.state.revision }
      : { content: {}, revision: 1 };
  }
  for (const version of Object.values(data.appVersions)) {
    delete (version as unknown as Record<string, unknown>)["stateSchemaId"];
    version.state ??= {
      schema: {
        types: { State: { dataType: DataType.Struct, properties: {} } },
        rootType: "State",
      },
      initialState: {},
    };
  }
}

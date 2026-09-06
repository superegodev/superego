import type { AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";

const emptyAppStateDefinition: AppStateDefinition = {
  schema: {
    types: { State: { dataType: DataType.Struct, properties: {} } },
    rootType: "State",
  },
  initialState: {},
};
export default emptyAppStateDefinition;

import type { AnyTypeDefinition } from "./typeDefinitions.js";

export default interface Schema {
  types: {
    [name: string]: AnyTypeDefinition;
  };
  rootType: string;
}

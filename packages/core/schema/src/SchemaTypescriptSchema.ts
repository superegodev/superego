import DataType from "./DataType.js?raw";
import Schema from "./Schema.js?raw";
import typeDefinitions from "./typeDefinitions.js?raw";

export default [
  DataType.replaceAll("export default DataType;\n", ""),
  typeDefinitions.replaceAll("export ", ""),
  Schema.replaceAll("export default ", ""),
]
  .join("\n")
  .replaceAll(/^\s*import[\s\S]*?;[ \t]*\r?\n?/gm, "");

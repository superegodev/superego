enum DataType {
  String = "String",

  /** A set of known strings. */
  Enum = "Enum",

  Number = "Number",

  Boolean = "Boolean",

  /** One specific String. */
  StringLiteral = "StringLiteral",

  /** One specific Number. */
  NumberLiteral = "NumberLiteral",

  /** One specific Boolean. */
  BooleanLiteral = "BooleanLiteral",

  JsonObject = "JsonObject",

  /** FileRef or ProtoFile, depending on the context. */
  File = "File",

  /** Object containing only known properties. */
  Struct = "Struct",

  /** List of items of another type. */
  List = "List",

  /** Reference to a Document. */
  DocumentRef = "DocumentRef",
}
export default DataType;

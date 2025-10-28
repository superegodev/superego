export default interface TypescriptFile {
  /** Absolute path of the file in the compilation environment. */
  path: `/${string}.ts` | `/${string}.tsx`;
  source: string;
}

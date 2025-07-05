export default interface TypescriptModule {
  /** The TypeScript source of the module. */
  source: string;
  /** The source compiled to JavaScript. */
  compiled: string;
}

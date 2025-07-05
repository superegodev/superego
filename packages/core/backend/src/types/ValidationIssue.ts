export default interface ValidationIssue {
  message: string;
  path?: { key: string | number }[] | undefined;
}

/*
 * Returns a new array made of of all the unique elements of the supplied array.
 */
export default function unique(arr: string[]): string[] {
  return [...new Set(arr)];
}

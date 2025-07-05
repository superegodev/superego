/*
 * Returns a new array made of elements that are contained in the first array
 * but are not contained in the second array.
 */
export default function difference(
  array1: string[],
  array2: string[],
): string[] {
  const set2 = new Set(array2);
  return array1.filter((item) => !set2.has(item));
}

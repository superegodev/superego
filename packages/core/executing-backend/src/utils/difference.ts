/*
 * Returns a new array made of elements that are contained in the first array
 * but are not contained in the second array.
 */
export default function difference<Element extends string>(
  array1: Element[],
  array2: Element[],
): Element[] {
  const set2 = new Set(array2);
  return array1.filter((item) => !set2.has(item));
}

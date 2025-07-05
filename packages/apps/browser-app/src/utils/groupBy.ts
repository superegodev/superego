export default function groupBy<Element>(
  elements: Element[],
  getGroupName: (element: Element) => string,
): Record<string, Element[]> {
  const result: Record<string, Element[]> = {};
  for (const element of elements) {
    const groupName = getGroupName(element);
    result[groupName] = result[groupName] ?? [];
    result[groupName].push(element);
  }
  return result;
}

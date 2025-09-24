export default function last<Element>(elements: Element[]): Element | null {
  return elements[elements.length - 1] ?? null;
}

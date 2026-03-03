export default function last<Element>(elements: Element[]): Element | null {
  return elements.at(-1) ?? null;
}

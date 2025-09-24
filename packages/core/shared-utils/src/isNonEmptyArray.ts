import type { NonEmptyArray } from "@superego/backend";

export default function isNonEmptyArray<Element>(
  elements: Element[],
): elements is NonEmptyArray<Element> {
  return elements.length !== 0;
}

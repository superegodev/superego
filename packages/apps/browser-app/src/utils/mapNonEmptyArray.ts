import type { NonEmptyArray } from "@superego/backend";

export default function mapNonEmptyArray<Element, MappedElement>(
  array: NonEmptyArray<Element>,
  callback: (
    value: Element,
    index: number,
    array: NonEmptyArray<Element>,
  ) => MappedElement,
): NonEmptyArray<MappedElement> {
  return array.map(callback as any) as NonEmptyArray<MappedElement>;
}

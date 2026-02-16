import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import { useUiOptions } from "./uiOptions.js";
import useMatchingLayout from "./useMatchingLayout.js";

export interface FieldUiOptions {
  layout?: DefaultDocumentViewUiOptions.Layout;
  hideLabel?: boolean;
  allowCollapsing?: boolean;
  grow?: boolean;
}

export default function useFieldUiOptions(name: string): FieldUiOptions {
  const { defaultDocumentViewUiOptions } = useUiOptions();
  const matchingLayout = useMatchingLayout(
    defaultDocumentViewUiOptions?.rootLayout ?? null,
  );

  if (!matchingLayout) {
    return {};
  }

  if (name === "") {
    return { layout: matchingLayout };
  }

  const node = findFieldNode(matchingLayout, toCanonicalPath(name));

  return node
    ? {
        layout: node.layout,
        hideLabel: node.hideLabel,
        allowCollapsing: node.allowCollapsing,
        grow: node.grow,
      }
    : {};
}

/**
 * Converts a React Hook Form name to a canonical property path.
 * RHF list items have names like "items.0.value.name", which should be
 * converted to "items.$.name" (replacing ".INDEX.value" with ".$").
 */
function toCanonicalPath(name: string): string {
  return name.replace(/\.(\d+)\.value(?=$|\.)/g, ".$");
}

function isFieldNode(
  node: DefaultDocumentViewUiOptions.HtmlAstNode,
): node is DefaultDocumentViewUiOptions.FieldNode {
  return "propertyPath" in node;
}

/**
 * Searches the layout tree for a FieldNode whose propertyPath matches
 * the given canonical path. Supports nested layouts: if a FieldNode's
 * propertyPath is a prefix of the target path, the search continues into
 * that FieldNode's nested layout.
 */
function findFieldNode(
  layout: DefaultDocumentViewUiOptions.Layout,
  canonicalPath: string,
): DefaultDocumentViewUiOptions.FieldNode | null {
  for (const node of layout) {
    if (isFieldNode(node)) {
      if (node.propertyPath === canonicalPath) {
        return node;
      }
      if (canonicalPath.startsWith(`${node.propertyPath}.`) && node.layout) {
        const remaining = canonicalPath.slice(node.propertyPath.length + 1);
        const found = findFieldNode(node.layout, remaining);
        if (found) {
          return found;
        }
      }
    } else if (node.children) {
      const found = findFieldNode(node.children, canonicalPath);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

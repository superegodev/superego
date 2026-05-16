import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import type { Schema, StructTypeDefinition } from "@superego/schema";
import type { CSSProperties } from "react";
import type { Control } from "react-hook-form";
import toTitleCase from "../../../utils/toTitleCase.js";
import AnyField from "./AnyField.js";

interface Props {
  layout: DefaultDocumentViewUiOptions.Layout;
  schema: Schema;
  typeDefinition: StructTypeDefinition;
  control: Control;
  name: string;
  autoFocus: boolean;
}
export default function LayoutRenderer({
  layout,
  schema,
  typeDefinition,
  control,
  name,
  autoFocus,
}: Props) {
  const autoFocusPath = autoFocus ? findFirstFieldPath(layout) : undefined;
  return layout.map((node, index) => (
    <AstNode
      // oxlint-disable-next-line react/no-array-index-key -- layout is a static AST that doesn't reorder.
      key={index}
      node={node}
      schema={schema}
      typeDefinition={typeDefinition}
      control={control}
      name={name}
      autoFocusPath={autoFocusPath}
    />
  ));
}

function AstNode({
  node,
  schema,
  typeDefinition,
  control,
  name,
  autoFocusPath,
}: {
  node: DefaultDocumentViewUiOptions.HtmlAstNode;
  schema: Schema;
  typeDefinition: StructTypeDefinition;
  control: Control;
  name: string;
  autoFocusPath: string | undefined;
}) {
  if ("propertyPath" in node) {
    const propertyName = node.propertyPath.split(".")[0]!;
    const propertyTypeDefinition = typeDefinition.properties[propertyName];
    if (!propertyTypeDefinition) {
      return null;
    }
    return (
      <AnyField
        schema={schema}
        typeDefinition={propertyTypeDefinition}
        isNullable={
          typeDefinition.nullableProperties?.includes(propertyName) ?? false
        }
        isListItem={false}
        control={control}
        name={name !== "" ? `${name}.${propertyName}` : propertyName}
        label={toTitleCase(propertyName)}
        autoFocus={propertyName === autoFocusPath}
      />
    );
  }

  return (
    <div style={node.style as CSSProperties}>
      {node.children?.map((child, index) => (
        <AstNode
          // Layout is a static AST that doesn't reorder.
          // oxlint-disable-next-line react/no-array-index-key -- see above.
          key={index}
          node={child}
          schema={schema}
          typeDefinition={typeDefinition}
          control={control}
          name={name}
          autoFocusPath={autoFocusPath}
        />
      ))}
    </div>
  );
}

function findFirstFieldPath(
  layout: DefaultDocumentViewUiOptions.Layout,
): string | undefined {
  for (const node of layout) {
    if ("propertyPath" in node) {
      return node.propertyPath.split(".")[0];
    }
    if (node.children) {
      const found = findFirstFieldPath(node.children);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

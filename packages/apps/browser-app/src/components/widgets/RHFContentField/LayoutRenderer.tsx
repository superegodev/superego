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
}
export default function LayoutRenderer({
  layout,
  schema,
  typeDefinition,
  control,
  name,
}: Props) {
  return layout.map((node, index) => (
    <AstNode
      // biome-ignore lint/suspicious/noArrayIndexKey: layout is a static AST that doesn't reorder.
      key={index}
      node={node}
      schema={schema}
      typeDefinition={typeDefinition}
      control={control}
      name={name}
    />
  ));
}

function AstNode({
  node,
  schema,
  typeDefinition,
  control,
  name,
}: {
  node: DefaultDocumentViewUiOptions.HtmlAstNode;
  schema: Schema;
  typeDefinition: StructTypeDefinition;
  control: Control;
  name: string;
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
      />
    );
  }
  return (
    <div style={node.style as CSSProperties}>
      {node.children?.map((child, index) => (
        <AstNode
          // biome-ignore lint/suspicious/noArrayIndexKey: layout is a static AST that doesn't reorder.
          key={index}
          node={child}
          schema={schema}
          typeDefinition={typeDefinition}
          control={control}
          name={name}
        />
      ))}
    </div>
  );
}

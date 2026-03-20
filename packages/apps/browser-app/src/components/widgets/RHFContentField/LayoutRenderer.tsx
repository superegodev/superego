import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import type { Schema, StructTypeDefinition } from "@superego/schema";
import { type CSSProperties, useRef } from "react";
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
  const autoFocusClaimedRef = useRef(false);
  autoFocusClaimedRef.current = false;
  return layout.map((node, index) => (
    <AstNode
      // Layout is a static AST that doesn't reorder.
      // biome-ignore lint/suspicious/noArrayIndexKey: see above.
      key={index}
      node={node}
      schema={schema}
      typeDefinition={typeDefinition}
      control={control}
      name={name}
      autoFocus={autoFocus}
      autoFocusClaimedRef={autoFocusClaimedRef}
    />
  ));
}

function AstNode({
  node,
  schema,
  typeDefinition,
  control,
  name,
  autoFocus,
  autoFocusClaimedRef,
}: {
  node: DefaultDocumentViewUiOptions.HtmlAstNode;
  schema: Schema;
  typeDefinition: StructTypeDefinition;
  control: Control;
  name: string;
  autoFocus: boolean;
  autoFocusClaimedRef: React.RefObject<boolean>;
}) {
  if ("propertyPath" in node) {
    const propertyName = node.propertyPath.split(".")[0]!;
    const propertyTypeDefinition = typeDefinition.properties[propertyName];
    if (!propertyTypeDefinition) {
      return null;
    }
    const shouldAutoFocus = autoFocus && !autoFocusClaimedRef.current;
    autoFocusClaimedRef.current = true;
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
        autoFocus={shouldAutoFocus}
      />
    );
  }

  return (
    <div style={node.style as CSSProperties}>
      {node.children?.map((child, index) => (
        <AstNode
          // Layout is a static AST that doesn't reorder.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above.
          key={index}
          node={child}
          schema={schema}
          typeDefinition={typeDefinition}
          control={control}
          name={name}
          autoFocus={autoFocus}
          autoFocusClaimedRef={autoFocusClaimedRef}
        />
      ))}
    </div>
  );
}

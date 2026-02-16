import type {
  DefaultDocumentViewUiOptions,
  ValidationIssue,
} from "@superego/backend";
import { DataType, type Schema, utils as schemaUtils } from "@superego/schema";
import * as v from "valibot";

export default function defaultDocumentViewUiOptions(
  schema: Schema,
): v.GenericSchema<DefaultDocumentViewUiOptions, DefaultDocumentViewUiOptions> {
  return v.pipe(
    v.looseObject({
      fullWidth: v.optional(v.boolean()),
      alwaysCollapsePrimarySidebar: v.optional(v.boolean()),
    }),
    v.rawCheck(({ dataset, addIssue }) => {
      if (!dataset.typed) {
        return;
      }
      for (const issue of validate(dataset.value, schema)) {
        const path = issue.path?.map((segment) => ({
          input: dataset.value,
          key: segment.key,
        }));
        addIssue({
          message: issue.message,
          path:
            path && path.length > 0
              ? (path as [v.IssuePathItem, ...v.IssuePathItem[]])
              : undefined,
        });
      }
    }),
  );
}

function validate(
  options: DefaultDocumentViewUiOptions,
  schema: Schema,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (options.rootLayout) {
    const rootType = schemaUtils.getRootType(schema);
    for (const [mediaFeatureExpression, layout] of Object.entries(
      options.rootLayout,
    )) {
      validateLayout(
        layout,
        rootType.properties,
        schema,
        [{ key: "rootLayout" }, { key: mediaFeatureExpression }],
        issues,
      );
    }
  }
  return issues;
}

function validateLayout(
  layout: DefaultDocumentViewUiOptions.Layout,
  structProperties: Record<string, unknown>,
  schema: Schema,
  path: { key: string | number }[],
  issues: ValidationIssue[],
): void {
  // Validate all nodes and collect FieldNode property paths.
  const foundPropertyPaths = new Set<string>();
  validateNodes(layout, schema, path, issues, foundPropertyPaths);

  // Check completeness: layout must contain ALL properties of the Struct.
  const expectedProperties = Object.keys(structProperties);
  for (const expectedProp of expectedProperties) {
    if (!foundPropertyPaths.has(expectedProp)) {
      issues.push({
        message: `Layout is missing property "${expectedProp}".`,
        path,
      });
    }
  }
}

function validateNodes(
  nodes: DefaultDocumentViewUiOptions.Layout,
  schema: Schema,
  path: { key: string | number }[],
  issues: ValidationIssue[],
  foundPropertyPaths: Set<string>,
): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const nodePath = [...path, { key: i }];

    if (isFieldNode(node)) {
      const propertyName = getTopLevelPropertyName(node.propertyPath);
      foundPropertyPaths.add(propertyName);

      const typeDef = schemaUtils.getTypeDefinitionAtPath(
        schema,
        node.propertyPath,
      );

      if (!typeDef) {
        issues.push({
          message: `Property path "${node.propertyPath}" does not exist in the schema.`,
          path: [...nodePath, { key: "propertyPath" }],
        });
        continue;
      }

      // Validate layout: only on Struct properties.
      if (node.layout !== undefined) {
        if (typeDef.dataType !== DataType.Struct) {
          issues.push({
            message: `"layout" can only be defined on Struct properties, but "${node.propertyPath}" is ${typeDef.dataType}.`,
            path: [...nodePath, { key: "layout" }],
          });
        } else {
          validateLayout(
            node.layout,
            typeDef.properties,
            schema,
            [...nodePath, { key: "layout" }],
            issues,
          );
        }
      }

      // Validate allowCollapsing: only on Struct and List properties.
      if (node.allowCollapsing !== undefined) {
        if (
          typeDef.dataType !== DataType.Struct &&
          typeDef.dataType !== DataType.List
        ) {
          issues.push({
            message: `"allowCollapsing" can only be defined on Struct and List properties, but "${node.propertyPath}" is ${typeDef.dataType}.`,
            path: [...nodePath, { key: "allowCollapsing" }],
          });
        }
      }
    } else {
      // DivNode: validate children recursively.
      if (node.children) {
        validateNodes(
          node.children,
          schema,
          [...nodePath, { key: "children" }],
          issues,
          foundPropertyPaths,
        );
      }
    }
  }
}

function isFieldNode(
  node: DefaultDocumentViewUiOptions.HtmlAstNode,
): node is DefaultDocumentViewUiOptions.FieldNode {
  return "propertyPath" in node;
}

function getTopLevelPropertyName(propertyPath: string): string {
  // PropertyPath is like "myProp" or "myProp.sub". The top-level property name
  // is the first segment.
  const dotIndex = propertyPath.indexOf(".");
  return dotIndex === -1 ? propertyPath : propertyPath.slice(0, dotIndex);
}

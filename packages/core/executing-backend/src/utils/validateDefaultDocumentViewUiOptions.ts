import type {
  DefaultDocumentViewUiOptions,
  ValidationIssue,
} from "@superego/backend";
import { DataType, type Schema, utils as schemaUtils } from "@superego/schema";

export default function validateDefaultDocumentViewUiOptions(
  options: DefaultDocumentViewUiOptions,
  schema: Schema,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (options.rootLayout) {
    const rootType = schemaUtils.getRootType(schema);
    validateLayout(
      options.rootLayout,
      rootType.properties,
      schema,
      [{ key: "rootLayout" }],
      issues,
    );
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
  // Collect all FieldNode property paths to verify completeness.
  const foundPropertyPaths = new Set<string>();

  for (let i = 0; i < layout.length; i++) {
    const node = layout[i]!;
    const nodePath = [...path, { key: i }];

    if (isFieldNode(node)) {
      const propertyName = getTopLevelPropertyName(node.propertyPath);
      foundPropertyPaths.add(propertyName);

      const typeDef = schemaUtils.getTypeDefinitionAtPath(
        schema,
        node.propertyPath.slice(1), // Remove leading "$".
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
        validateLayout(
          node.children,
          structProperties,
          schema,
          [...nodePath, { key: "children" }],
          issues,
        );
        // Collect property paths from children.
        collectFieldPropertyPaths(node.children, foundPropertyPaths);
      }
    }
  }

  // Check completeness: layout must contain ALL properties of the Struct.
  const expectedProperties = Object.keys(structProperties);
  for (const expectedProp of expectedProperties) {
    if (!foundPropertyPaths.has(expectedProp)) {
      issues.push({
        message: `Layout is missing property "$${expectedProp}".`,
        path,
      });
    }
  }
}

function collectFieldPropertyPaths(
  layout: DefaultDocumentViewUiOptions.Layout,
  result: Set<string>,
): void {
  for (const node of layout) {
    if (isFieldNode(node)) {
      result.add(getTopLevelPropertyName(node.propertyPath));
    } else if (node.children) {
      collectFieldPropertyPaths(node.children, result);
    }
  }
}

function isFieldNode(
  node: DefaultDocumentViewUiOptions.HtmlAstNode,
): node is DefaultDocumentViewUiOptions.FieldNode {
  return "propertyPath" in node;
}

function getTopLevelPropertyName(
  propertyPath: DefaultDocumentViewUiOptions.PropertyPath,
): string {
  // PropertyPath is like "$myProp" or "$myProp.sub". The top-level property
  // name is the first segment after "$".
  const withoutDollar = propertyPath.slice(1); // Remove "$".
  const dotIndex = withoutDollar.indexOf(".");
  return dotIndex === -1 ? withoutDollar : withoutDollar.slice(0, dotIndex);
}

import { resolveVar } from "@superego/themes";

const CSS_VAR_PREFIX = "var(";

export default function deepResolveCssVars<Value>(
  value: Value,
  styles: CSSStyleDeclaration,
): Value {
  if (typeof value === "string" && value.startsWith(CSS_VAR_PREFIX)) {
    return resolveVar(styles, value) as Value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepResolveCssVars(item, styles)) as Value;
  }
  if (value !== null && typeof value === "object") {
    const resolvedValue: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      resolvedValue[key] = deepResolveCssVars(
        (value as Record<string, unknown>)[key],
        styles,
      );
    }
    return resolvedValue as Value;
  }
  return value;
}

const CSS_VAR_REGEX = /^var\(\s*(--[^,\s)]+)\s*(?:,\s*(.+))?\)$/;

export default function resolveVar(
  styles: CSSStyleDeclaration,
  value: string,
): string {
  const trimmedValue = value.trim();
  const match = CSS_VAR_REGEX.exec(trimmedValue);
  if (!match) {
    return trimmedValue;
  }

  const [, variableName, fallback] = match;
  if (!variableName) {
    return trimmedValue;
  }

  const computedValue = styles.getPropertyValue(variableName)?.trim();

  if (computedValue) {
    return CSS_VAR_REGEX.test(computedValue)
      ? resolveVar(styles, computedValue)
      : computedValue;
  }

  if (fallback) {
    return resolveVar(styles, fallback);
  }

  return trimmedValue;
}

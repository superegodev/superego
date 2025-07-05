/**
 * Formats an identifier (for a type name, a property name, or an enum member
 * name) to make it more human-readable.
 */
export default function formatIdentifier(identifier: string): string {
  // Insert a space before any uppercase letter that follows a lowercase letter.
  const spacedString = identifier.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Capitalize the first letter of each word and make the rest lowercase.
  return spacedString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

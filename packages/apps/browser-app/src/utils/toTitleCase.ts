export default function toTitleCase(str: string): string {
  return (
    str
      // Insert a space before any uppercase letter that follows a lowercase letter.
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Replace _ with spaces.
      .replaceAll("_", " ")
      // Capitalize the first letter of each word and make the rest lowercase.
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
}

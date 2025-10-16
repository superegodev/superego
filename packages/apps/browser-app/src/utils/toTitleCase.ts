export default function toTitleCase(str: string): string {
  return (
    str
      // Insert a space before any uppercase letter that follows a lowercase
      // letter.
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Insert a space before any uppercase letter that is followed by a
      // lowercase letter.
      .replace(/([A-Z])([a-z])/g, " $1$2")
      // Remove duplicate spaces and initial spaces caused by the two replaces
      // above.
      .replaceAll("  ", " ")
      .replace(/^ /, "")
      // Replace _ with spaces.
      .replaceAll("_", " ")
      // Capitalize the first letter of each word and make the rest lowercase,
      // unless the whole word is uppercase (to preserve acronyms).
      .split(" ")
      .map((word) =>
        word.toUpperCase() === word
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ")
  );
}

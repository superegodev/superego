export default function classnames(
  ...classNames: (string | false | undefined)[]
): string {
  return classNames
    .filter((className) => typeof className === "string")
    .join(" ");
}

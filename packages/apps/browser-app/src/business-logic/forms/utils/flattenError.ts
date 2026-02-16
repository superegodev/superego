interface FlatError {
  path: string;
  message: string;
}

// RHF errors are nested structure mirroring the structure of the form values.
// At the level at which the error exists, there's a message property with the
// error message. Example (for a Schema error):
//
// {
//   "types": {
//     "%FuelType": {
//       "message": "Invalid identifier: Should match /^[a-zA-Z_][a-zA-Z0-9_]{0,127}$/ but received \"%FuelType\""
//       "members": {
//         "%G95E5": {
//           "message": "Invalid identifier: Should match /^[a-zA-Z_][a-zA-Z0-9_]{0,127}$/ but received \"%G95E5\""
//         }
//       }
//     }
//   }
// }
//
// This function collects all errors by traversing that object.
export default function flattenError(
  input: unknown,
  basePath: (string | number)[] = [],
): FlatError[] {
  const errors: FlatError[] = [];
  const seen = new WeakSet<object>();

  const walk = (node: unknown, path: (string | number)[]) => {
    if (Array.isArray(node)) {
      node.forEach((value, index) => walk(value, path.concat(index)));
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (seen.has(obj)) {
        // Guard against cycles.
        return;
      }
      seen.add(obj);

      if ("message" in obj && typeof obj["message"] === "string") {
        errors.push({ path: toDotPath(path), message: obj["message"] });
      }

      for (const [key, value] of Object.entries(obj)) {
        if (key === "message") continue;
        walk(value, path.concat(key));
      }
    }
  };

  walk(input, basePath);
  return errors;
}

function toDotPath(path: (string | number)[]): string {
  return path
    .map((segment) => (typeof segment === "number" ? String(segment) : segment))
    .join(".");
}

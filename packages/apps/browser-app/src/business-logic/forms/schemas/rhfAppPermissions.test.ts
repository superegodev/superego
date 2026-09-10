import { createIntl } from "react-intl";
import * as v from "valibot";
import { expect, it } from "vitest";
import messages from "../../../translations/compiled/en.json" with { type: "json" };
import rhfAppPermissions from "./rhfAppPermissions.js";

it("reports invalid origins at the editable value path", () => {
  // Setup SUT
  const schema = rhfAppPermissions(createIntl({ locale: "en", messages }));

  // Exercise
  const result = v.safeParse(schema, {
    modals: false,
    downloads: true,
    http: {
      allowedOrigins: [
        { value: "https://api.example.com" },
        { value: "https://api.example.com/path" },
      ],
    },
  });

  // Verify
  expect(result.success).toBe(false);
  expect(result.issues?.map((issue) => v.getDotPath(issue))).toEqual([
    "http.allowedOrigins.1.value",
  ]);
});

it.each([
  { allowedOrigins: [] },
  { allowedOrigins: [{ value: "https://api.example.com" }] },
])(
  "accepts valid form permissions with origins $allowedOrigins",
  ({ allowedOrigins }) => {
    // Setup SUT
    const schema = rhfAppPermissions(createIntl({ locale: "en", messages }));
    const permissions = {
      modals: true,
      downloads: false,
      http: { allowedOrigins },
    };

    // Exercise
    const result = v.safeParse(schema, permissions);

    // Verify
    expect(result.success).toBe(true);
    expect(result.output).toEqual(permissions);
  },
);

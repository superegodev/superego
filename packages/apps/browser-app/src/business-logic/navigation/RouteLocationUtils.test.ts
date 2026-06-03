import { RouteName } from "@superego/routing";
import { describe, expect, it } from "vitest";
import { fromBrowserLocation, toBrowserHref } from "./RouteLocationUtils.js";

describe("fromBrowserLocation", () => {
  it("returns ask when hash routing is enabled and the URL has no hash", () => {
    // Exercise
    const route = fromBrowserLocation(
      {
        href: "file:///Applications/Superego.app/Contents/Resources/app.asar/dist/renderer/index.html",
        hash: "",
      },
      true,
    );

    // Verify
    expect(route).toEqual({ name: RouteName.Ask });
  });

  it("returns the hash route when hash routing is enabled", () => {
    // Exercise
    const route = fromBrowserLocation(
      {
        href: "file:///Applications/Superego.app/Contents/Resources/app.asar/dist/renderer/index.html#/unknown",
        hash: "#/unknown",
      },
      true,
    );

    // Verify
    expect(route).toEqual({ name: RouteName.NotFound, route: "/unknown" });
  });

  it("returns the pathname route when hash routing is disabled", () => {
    // Exercise
    const route = fromBrowserLocation(
      { href: "http://localhost/unknown", hash: "" },
      false,
    );

    // Verify
    expect(route).toEqual({ name: RouteName.NotFound, route: "/unknown" });
  });
});

describe("toBrowserHref", () => {
  it("returns a hash href when hash routing is enabled", () => {
    // Exercise
    const href = toBrowserHref({ name: RouteName.Ask }, true);

    // Verify
    expect(href).toBe("#/");
  });

  it("returns a pathname href when hash routing is disabled", () => {
    // Exercise
    const href = toBrowserHref({ name: RouteName.Ask }, false);

    // Verify
    expect(href).toBe("/");
  });
});

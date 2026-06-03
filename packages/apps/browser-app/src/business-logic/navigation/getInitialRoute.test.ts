import { RouteName } from "@superego/routing";
import { describe, expect, it } from "vitest";
import getInitialRoute from "./getInitialRoute.js";

describe("getInitialRoute", () => {
  it("returns ask when the app is loaded from a file URL", () => {
    // Exercise
    const route = getInitialRoute({
      href: "file:///Applications/Superego.app/Contents/Resources/app.asar/dist/renderer/index.html",
      protocol: "file:",
    });

    // Verify
    expect(route).toEqual({ name: RouteName.Ask });
  });

  it("returns not found when an app route is unknown", () => {
    // Exercise
    const route = getInitialRoute({
      href: "http://localhost/unknown",
      protocol: "http:",
    });

    // Verify
    expect(route).toEqual({ name: RouteName.NotFound, route: "/unknown" });
  });
});

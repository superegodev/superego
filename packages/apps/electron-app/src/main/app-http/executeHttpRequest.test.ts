import { readFileSync } from "node:fs";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { createServer as createHttpsServer } from "node:https";
import type { AddressInfo } from "node:net";
import { describe, expect, it, vi } from "vitest";
import * as destinationPolicy from "./destinationPolicy.js";
import executeHttpRequest from "./executeHttpRequest.js";

async function withServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  run: (origin: string) => Promise<void>,
) {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
const assertCurrent = async () => {};

describe("host HTTP transport", () => {
  it("round-trips opaque binary and returns HTTP error responses", async () => {
    // Setup SUT
    await withServer(
      (request, response) => {
        const chunks: Buffer[] = [];
        request.on("data", (chunk) => chunks.push(chunk));
        request.on("end", () => {
          response.writeHead(400, {
            "X-Echo": request.headers.authorization ?? "none",
          });
          response.end(Buffer.concat(chunks));
        });
      },
      async (origin) => {
        // Exercise
        const result = await executeHttpRequest(
          {
            url: origin,
            method: "POST",
            headers: [["Authorization", "Bearer supplied"]],
            body: { encoding: "base64", data: "AP+A" },
          },
          [origin],
          AbortSignal.timeout(5000),
          assertCurrent,
        );
        // Verify
        expect(result.status).toBe(400);
        expect(result.body).toEqual({ encoding: "base64", data: "AP+A" });
        expect(result.headers).toContainEqual(["X-Echo", "Bearer supplied"]);
        expect(result.url).toBe(`${origin}/`);
      },
    );
  });
  it("authorizes redirects before forwarding and strips all cross-origin headers", async () => {
    // Setup SUT
    let reached = 0;
    let authorization: string | undefined;
    let method: string | undefined;
    await withServer(
      (request, response) => {
        reached++;
        authorization = request.headers.authorization;
        method = request.method;
        response.end("ok");
      },
      async (destination) => {
        await withServer(
          (_request, response) => {
            response.writeHead(302, { Location: destination });
            response.end();
          },
          async (origin) => {
            // Exercise
            const denied = executeHttpRequest(
              { url: origin },
              [origin],
              AbortSignal.timeout(5000),
              assertCurrent,
            );
            // Verify
            await expect(denied).rejects.toThrow();
            expect(reached).toBe(0);
            // Exercise
            const result = await executeHttpRequest(
              {
                url: origin,
                method: "POST",
                headers: [["Authorization", "secret"]],
                body: { encoding: "utf8", data: "opaque" },
              },
              [origin, destination],
              AbortSignal.timeout(5000),
              assertCurrent,
            );
            // Verify
            expect(result.status).toBe(200);
            expect(authorization).toBeUndefined();
            expect(method).toBe("GET");
          },
        );
      },
    );
  });
  it("bounds redirect loops and aborts obsolete instances", async () => {
    // Setup SUT
    let reached = 0;
    await withServer(
      (_request, response) => {
        reached++;
        response.writeHead(307, { Location: "/again" });
        response.end();
      },
      async (origin) => {
        // Exercise
        const result = executeHttpRequest(
          { url: origin },
          [origin],
          AbortSignal.timeout(5000),
          assertCurrent,
        );
        // Verify
        await expect(result).rejects.toThrow("Redirect limit");
        expect(reached).toBe(6);
        // Exercise
        const obsolete = executeHttpRequest(
          { url: origin },
          [origin],
          AbortSignal.abort(),
          assertCurrent,
        );
        // Verify
        await expect(obsolete).rejects.toThrow();
        expect(reached).toBe(6);
      },
    );
  });
  it("connects to the pinned address while retaining the URL authority", async () => {
    // Setup SUT
    await withServer(
      (request, response) => {
        response.end(request.headers.host);
      },
      async (origin) => {
        const url = origin.replace("127.0.0.1", "public.example.test");
        const authorization = vi
          .spyOn(destinationPolicy, "authorizeDestination")
          .mockResolvedValue({ address: "127.0.0.1", family: 4 });
        try {
          // Exercise
          const result = await executeHttpRequest(
            { url },
            [url],
            AbortSignal.timeout(5000),
            assertCurrent,
          );
          // Verify
          expect(Buffer.from(result.body.data, "base64").toString()).toBe(
            new URL(url).host,
          );
        } finally {
          authorization.mockRestore();
        }
      },
    );
  });

  it("preserves TLS certificate verification", async () => {
    // Setup SUT
    const server = createHttpsServer(
      {
        key: readFileSync(
          new URL("./fixtures/self-signed.key", import.meta.url),
        ),
        cert: readFileSync(
          new URL("./fixtures/self-signed.crt", import.meta.url),
        ),
      },
      (_request, response) => response.end("must not be accepted"),
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    try {
      const origin = `https://127.0.0.1:${(server.address() as AddressInfo).port}`;
      // Exercise
      const result = executeHttpRequest(
        { url: origin },
        [origin],
        AbortSignal.timeout(5000),
        assertCurrent,
      );
      // Verify
      await expect(result).rejects.toMatchObject({
        code: "DEPTH_ZERO_SELF_SIGNED_CERT",
      });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

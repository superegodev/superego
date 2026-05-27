interface Env {
  RESPONSES_BASE_URL: string;
  RESPONSES_API_KEY: string;
  IP_RATE_LIMITER: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!(request.method === "POST" && url.pathname === "/api/v1/responses")) {
      return new Response(null, { status: 404 });
    }

    const { success } = await env.IP_RATE_LIMITER.limit({
      key: request.headers.get("cf-connecting-ip") ?? "unknown",
    });
    if (!success) {
      return new Response("Too many requests from your IP.", { status: 429 });
    }

    const upstreamResponse = await fetch(env.RESPONSES_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESPONSES_API_KEY}`,
        "Content-Type":
          request.headers.get("Content-Type") ?? "application/json",
      },
      body: request.body,
      signal: request.signal,
    });

    if (upstreamResponse.ok) {
      return upstreamResponse;
    }

    return sanitizeFailedUpstreamResponse(upstreamResponse);
  },
} satisfies ExportedHandler<Env>;

async function sanitizeFailedUpstreamResponse(response: Response) {
  const responseBody = await response.json().catch(() => null);
  return Response.json(sanitizeErrorBody(responseBody), {
    status: response.status,
    statusText: response.statusText,
  });
}

function sanitizeErrorBody(responseBody: unknown) {
  if (!isRecord(responseBody)) {
    return { error: { message: "Inference provider request failed" } };
  }

  const errorBody = responseBody["error"];
  if (!isRecord(errorBody)) {
    return { error: { message: "Inference provider request failed" } };
  }

  return {
    error: {
      message:
        typeof errorBody["message"] === "string"
          ? errorBody["message"]
          : "Inference provider request failed",
      code: extractSafePrimitive(errorBody["code"]),
      type: extractSafePrimitive(errorBody["type"]),
      status: extractSafePrimitive(errorBody["status"]),
    },
  };
}

function extractSafePrimitive(value: unknown) {
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? value
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

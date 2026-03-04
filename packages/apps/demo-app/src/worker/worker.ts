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

    return fetch(env.RESPONSES_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESPONSES_API_KEY}`,
        "Content-Type":
          request.headers.get("Content-Type") ?? "application/json",
      },
      body: request.body,
      signal: request.signal,
    });
  },
} satisfies ExportedHandler<Env>;

interface Env {
  CHAT_COMPLETIONS_BASE_URL: string;
  CHAT_COMPLETIONS_API_KEY: string;
  IP_RATE_LIMITER: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      !(
        request.method === "POST" &&
        url.pathname === "/api/openai/v1/chat/completions"
      )
    ) {
      return new Response(null, { status: 404 });
    }

    const { success } = await env.IP_RATE_LIMITER.limit({
      key: request.headers.get("cf-connecting-ip") ?? "unknown",
    });
    if (!success) {
      return new Response("Too many requests from your IP.", { status: 429 });
    }

    return fetch(env.CHAT_COMPLETIONS_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CHAT_COMPLETIONS_API_KEY}`,
        "Content-Type": request.headers.get("Content-Type") ?? "",
      },
      body: request.body,
      signal: request.signal,
    });
  },
} satisfies ExportedHandler<Env>;

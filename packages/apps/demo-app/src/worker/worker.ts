interface Env {
  CHAT_COMPLETIONS_BASE_URL: string;
  CHAT_COMPLETIONS_API_KEY: string;
  TRANSCRIPTIONS_BASE_URL: string;
  TRANSCRIPTIONS_API_KEY: string;
  IP_RATE_LIMITER: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isChatCompletionsRequest =
      url.pathname === "/api/openai/v1/chat/completions";
    const isTranscriptionsRequest =
      url.pathname === "/api/openai/v1/audio/transcriptions";

    if (
      !(
        request.method === "POST" &&
        (isChatCompletionsRequest || isTranscriptionsRequest)
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

    const baseUrl = isChatCompletionsRequest
      ? env.CHAT_COMPLETIONS_BASE_URL
      : env.TRANSCRIPTIONS_BASE_URL;
    const apiKey = isChatCompletionsRequest
      ? env.CHAT_COMPLETIONS_API_KEY
      : env.TRANSCRIPTIONS_API_KEY;
    return fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": request.headers.get("Content-Type") ?? "",
      },
      body: request.body,
      signal: request.signal,
    });
  },
} satisfies ExportedHandler<Env>;

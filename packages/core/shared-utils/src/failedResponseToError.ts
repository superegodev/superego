import safeStringify from "safe-stringify";

export default async function failedResponseToError(
  requestMethod: string,
  requestBody: any,
  response: Response,
): Promise<Error> {
  const responseBody = await response
    .json()
    .catch(() => response.text())
    .then((text) => text)
    .catch(() => "Unable to get response body");
  return new Error(
    [
      `HTTP ${response.status} error calling ${requestMethod} ${response.url}:`,
      "Request body:",
      requestBody instanceof FormData
        ? safeStringify(Object.fromEntries(requestBody))
        : safeStringify(requestBody),
      "Response body:",
      safeStringify(responseBody),
    ].join("\n"),
  );
}

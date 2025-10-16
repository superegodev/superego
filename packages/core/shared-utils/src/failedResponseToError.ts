import ResponseError from "./ResponseError.js";

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
  return new ResponseError(
    `HTTP ${response.status} error calling ${requestMethod} ${response.url}`,
    requestMethod,
    response.url,
    requestBody instanceof FormData
      ? Object.fromEntries(requestBody)
      : requestBody,
    response.status,
    responseBody,
  );
}

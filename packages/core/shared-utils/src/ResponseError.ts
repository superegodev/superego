export default class ResponseError extends Error {
  override name = "ResponseError";
  constructor(
    message: string,
    public requestMethod: string,
    public requestUrl: string,
    public requestBody: any,
    public responseStatus: number,
    public responseBody: any,
  ) {
    super(message);
  }
}

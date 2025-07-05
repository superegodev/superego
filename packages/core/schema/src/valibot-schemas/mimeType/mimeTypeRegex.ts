/**
 * Mime type examples:
 *
 * - `text/html`
 * - `APPLICATION/JSON`
 * - `image/svg+xml`
 * - `application/vnd.ms-excel`
 *
 * Regex explanation:
 *
 * ![Regex explanation](./mimeTypeRegex.svg)
 *
 */
export default /^([a-zA-Z0-9!#$%&'*+\-.^_`|~]+)\/([a-zA-Z0-9!#$%&'*+\-.^_`|~]+)$/;

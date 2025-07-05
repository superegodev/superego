/**
 * A mime-type matcher is a "glob pattern" for mime types.
 *
 * Examples:
 *
 * - `image/*`: matches all image mime types.
 * - `image/png`: matches only the image/png mime type.
 * - `* /*` (without the space): matches all mime types.
 *
 * Regex explanation:
 *
 * ![Regex explanation](./mimeTypeMatcherRegex.svg)
 *
 */
export default /^([a-zA-Z0-9!#$&'+\-.^_`|~]+)\/(?:([a-zA-Z0-9!#$&'+\-.^_`|~]+(?:\+[a-zA-Z0-9!#$&'+\-.^_`|~]+)?)|(\*))|(\*\/\*)$/;

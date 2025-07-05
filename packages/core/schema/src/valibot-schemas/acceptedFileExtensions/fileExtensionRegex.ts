/**
 * File extension examples:
 *
 * - `.png`
 * - `.svg`
 * - `.tar.gz`
 * - `.module.js`
 * - `.my-config`
 * - `._internal`
 *
 * Regex explanation:
 *
 * ![Regex explanation](./fileExtensionRegex.svg)
 *
 */
export default /^\.\w[\w.-]*$/;

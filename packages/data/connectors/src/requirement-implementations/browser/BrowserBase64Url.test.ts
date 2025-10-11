import registerBase64UrlTests from "../../requirements/tests/Base64Url.js";
import BrowserBase64Url from "./BrowserBase64Url.js";

registerBase64UrlTests(() => new BrowserBase64Url());

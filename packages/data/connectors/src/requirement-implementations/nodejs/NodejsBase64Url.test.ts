import registerBase64UrlTests from "../../requirements/tests/Base64Url.js";
import NodejsBase64Url from "./NodejsBase64Url.js";

registerBase64UrlTests(() => new NodejsBase64Url());

/// <reference types="vite/client" />
import getQuickJS from "./getQuickJS.nodejs.js";
import QuickjsJavascriptSandbox from "./QuickjsJavascriptSandbox.js";

QuickjsJavascriptSandbox.getQuickJS = getQuickJS;

export { default as QuickjsJavascriptSandbox } from "./QuickjsJavascriptSandbox.js";

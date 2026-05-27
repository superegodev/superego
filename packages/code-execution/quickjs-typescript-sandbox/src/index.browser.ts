/// <reference types="vite/client" />
import getQuickJS from "./getQuickJS.browser.js";
import QuickjsTypescriptSandbox from "./QuickjsTypescriptSandbox.js";

QuickjsTypescriptSandbox.getQuickJS = getQuickJS;

export { default as QuickjsTypescriptSandbox } from "./QuickjsTypescriptSandbox.js";

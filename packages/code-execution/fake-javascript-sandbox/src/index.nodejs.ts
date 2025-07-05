import FakeJavascriptSandbox from "./FakeJavascriptSandbox.js";
import importModule from "./importModule.nodejs.js";

FakeJavascriptSandbox.importModule = importModule;

export { default as FakeJavascriptSandbox } from "./FakeJavascriptSandbox.js";

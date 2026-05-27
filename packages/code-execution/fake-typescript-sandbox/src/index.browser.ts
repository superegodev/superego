import FakeTypescriptSandbox from "./FakeTypescriptSandbox.js";
import importModule from "./importModule.browser.js";

FakeTypescriptSandbox.importModule = importModule;

export { default as FakeTypescriptSandbox } from "./FakeTypescriptSandbox.js";

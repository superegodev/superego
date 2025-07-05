/// <reference types="vite/client" />
import { Theme } from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({ theme: Theme.Auto }),
  new FakeJavascriptSandbox(),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
});

renderBrowserApp(backend, queryClient);

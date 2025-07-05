/// <reference types="vite/client" />
import { renderBrowserApp } from "@superego/browser-app";
import { QueryClient } from "@tanstack/react-query";
import type BackendIPCProxyClient from "../ipc-proxy/BackendIPCProxyClient.js";

declare global {
  interface Window {
    backend: BackendIPCProxyClient;
  }
}

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

renderBrowserApp(window.backend, queryClient);

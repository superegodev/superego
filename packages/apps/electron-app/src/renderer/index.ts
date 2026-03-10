/// <reference types="vite/client" />
import { navigateToHref, renderBrowserApp } from "@superego/browser-app";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: "always",
    },
  },
});

renderBrowserApp((window as any).backend, queryClient);

window.addEventListener("message", (evt) => {
  if (evt.data?.type === "OAuth2PKCEFlowSucceeded") {
    queryClient.invalidateQueries({ queryKey: ["listCollections"] });
  }
  if (
    evt.data?.type === "NavigationRequested" &&
    typeof evt.data.href === "string"
  ) {
    navigateToHref(evt.data.href);
  }
});

console.log(
  "Want to play with Superego from here? Use the global %cbackend%c object.",
  "font-weight:bold;",
  "color:inherit;",
  "Its API is here: https://github.com/superegodev/superego/blob/main/packages/core/backend/src/Backend.ts",
);

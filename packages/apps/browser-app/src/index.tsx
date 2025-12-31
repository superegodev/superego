/// <reference types="vite/client" />
import type { Backend } from "@superego/backend";
import type { QueryClient } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BrowserApp from "./BrowserApp.js";
import type LoadDemoDataFn from "./business-logic/load-demo-data/LoadDemoDataFn.js";

export function renderBrowserApp(
  backend: Backend,
  queryClient: QueryClient,
  loadDemoData?: LoadDemoDataFn,
) {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  createRoot(root).render(
    <StrictMode>
      <BrowserApp
        backend={backend}
        queryClient={queryClient}
        loadDemoData={loadDemoData}
      />
    </StrictMode>,
  );
}

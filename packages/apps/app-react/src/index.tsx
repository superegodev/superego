import { connectSuperego } from "@superego/app-client";
import type { AppComponentProps } from "@superego/app-sandbox/types";
import { StrictMode, type ReactElement } from "react";
import { createRoot } from "react-dom/client";

export interface CreateSuperegoReactAppOptions {
  root: HTMLElement;
  render: (props: AppComponentProps) => ReactElement | null;
}

export async function createSuperegoReactApp({
  root,
  render,
}: CreateSuperegoReactAppOptions): Promise<void> {
  const client = await connectSuperego();
  createRoot(root).render(<StrictMode>{render(client.appProps)}</StrictMode>);
}

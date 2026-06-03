import { fromHref } from "@superego/routing";
import { useNavigationStateStore } from "./useNavigationState.js";

export default function navigateToHref(href: string): void {
  const route = fromHref(href);
  useNavigationStateStore.getState().navigateTo(route);
}

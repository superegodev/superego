import { create } from "zustand";
import type Route from "./Route.js";
import { RouteName } from "./Route.js";
import { fromHref, toHref } from "./RouteUtils.js";

const useNavigationStateStore = create<UseNavigationState>((set) => ({
  activeRoute: fromHref(getCurrentHref()) ?? {
    name: RouteName.Assistant,
  },
  navigateTo(route, updateUrl = true) {
    set({ activeRoute: route });
    if (updateUrl) {
      window.history.pushState({}, "", toHref(route));
    }
  },
}));
window.addEventListener("popstate", () => {
  useNavigationStateStore
    .getState()
    .navigateTo(fromHref(getCurrentHref()), false);
});

interface UseNavigationState {
  activeRoute: Route;
  navigateTo(route: Route, updateUrl?: boolean): void;
}
export default function useNavigationState(): UseNavigationState {
  return useNavigationStateStore();
}

function getCurrentHref() {
  return window.location.pathname + window.location.hash;
}

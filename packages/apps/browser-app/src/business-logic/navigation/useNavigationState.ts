import { create } from "zustand";
import type Route from "./Route.js";
import { RouteName } from "./Route.js";
import { fromHref, toHref } from "./RouteUtils.js";

const useNavigationStateStore = create<UseNavigationState>((set) => ({
  activeRoute: fromHref(window.location.pathname) ?? {
    name: RouteName.Ask,
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
    .navigateTo(fromHref(window.location.pathname), false);
});

interface UseNavigationState {
  activeRoute: Route;
  navigateTo(route: Route, updateUrl?: boolean): void;
}
export default function useNavigationState(): UseNavigationState {
  return useNavigationStateStore();
}

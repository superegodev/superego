import { create } from "zustand";
import type Route from "./Route.js";
import { fromHref, toHref } from "./RouteUtils.js";

const initialRoute = fromHref(window.location.href);

const useNavigationStateStore = create<UseNavigationState>((set, get) => ({
  activeRoute: initialRoute,
  historyStack: [initialRoute],
  currentHistoryPosition: 0,
  canGoBack: false,
  navigateTo(route, updateUrl = true) {
    const { historyStack, currentHistoryPosition, activeRoute } = get();
    if (toHref(route) === toHref(activeRoute)) {
      return;
    }
    const newStack = [
      ...historyStack.slice(0, currentHistoryPosition + 1),
      route,
    ];
    const newPosition = newStack.length - 1;
    set({
      activeRoute: route,
      historyStack: newStack,
      currentHistoryPosition: newPosition,
      canGoBack: newPosition > 0,
    });
    if (updateUrl) {
      window.history.pushState({}, "", toHref(route));
    }
  },
  goBack() {
    const { currentHistoryPosition } = get();
    if (currentHistoryPosition > 0) {
      window.history.back();
    }
  },
}));

window.addEventListener("popstate", () => {
  const route = fromHref(window.location.href);
  const { historyStack, currentHistoryPosition } =
    useNavigationStateStore.getState();
  const previousRoute = historyStack[currentHistoryPosition - 1];
  const nextRoute = historyStack[currentHistoryPosition + 1];

  if (previousRoute && toHref(previousRoute) === toHref(route)) {
    const newPosition = currentHistoryPosition - 1;
    useNavigationStateStore.setState({
      activeRoute: route,
      currentHistoryPosition: newPosition,
      canGoBack: newPosition > 0,
    });
  } else if (nextRoute && toHref(nextRoute) === toHref(route)) {
    const newPosition = currentHistoryPosition + 1;
    useNavigationStateStore.setState({
      activeRoute: route,
      currentHistoryPosition: newPosition,
      canGoBack: true,
    });
  } else {
    useNavigationStateStore.setState({ activeRoute: route });
  }
});

interface UseNavigationState {
  activeRoute: Route;
  historyStack: Route[];
  currentHistoryPosition: number;
  canGoBack: boolean;
  navigateTo(route: Route, updateUrl?: boolean): void;
  goBack(): void;
}
export default function useNavigationState(): UseNavigationState {
  return useNavigationStateStore();
}

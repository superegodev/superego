import { create } from "zustand";
import type Route from "./Route.js";
import { fromHref, toHref } from "./RouteUtils.js";

const initialRoute = fromHref(window.location.href);

export const useNavigationStateStore = create<UseNavigationState>(
  (set, get) => ({
    activeRoute: initialRoute,
    historyStack: [initialRoute],
    currentHistoryPosition: 0,
    canGoBack: false,
    exitWarningMessage: null,
    setExitWarningMessage(message) {
      set({ exitWarningMessage: message });
    },
    navigateTo(route, options = {}) {
      const { ignoreExitWarning = false, stateChangeType = "push" } = options;
      const {
        historyStack,
        currentHistoryPosition,
        activeRoute,
        exitWarningMessage,
      } = get();
      if (toHref(route) === toHref(activeRoute)) {
        return;
      }
      if (
        exitWarningMessage &&
        !ignoreExitWarning &&
        !window.confirm(exitWarningMessage)
      ) {
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
        exitWarningMessage: null,
      });
      window.history[stateChangeType === "push" ? "pushState" : "replaceState"](
        {},
        "",
        toHref(route),
      );
    },
    goBack() {
      const { currentHistoryPosition } = get();
      if (currentHistoryPosition > 0) {
        window.history.back();
      }
    },
  }),
);

window.addEventListener("beforeunload", (event) => {
  const { exitWarningMessage } = useNavigationStateStore.getState();
  if (!exitWarningMessage) {
    return;
  }
  // Preventing default makes the browser show a generic message to confirm
  // exiting the page. Unfortunately, it's not possible to show a custom message
  // (browsers don't allow it).
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("popstate", () => {
  const {
    historyStack,
    currentHistoryPosition,
    activeRoute,
    exitWarningMessage,
  } = useNavigationStateStore.getState();

  if (exitWarningMessage && !window.confirm(exitWarningMessage)) {
    // Re-push current URL to cancel navigation.
    window.history.pushState({}, "", toHref(activeRoute));
    return;
  }

  const route = fromHref(window.location.href);
  const previousRoute = historyStack[currentHistoryPosition - 1];
  const nextRoute = historyStack[currentHistoryPosition + 1];

  if (previousRoute && toHref(previousRoute) === toHref(route)) {
    const newPosition = currentHistoryPosition - 1;
    useNavigationStateStore.setState({
      activeRoute: route,
      currentHistoryPosition: newPosition,
      canGoBack: newPosition > 0,
      exitWarningMessage: null,
    });
  } else if (nextRoute && toHref(nextRoute) === toHref(route)) {
    const newPosition = currentHistoryPosition + 1;
    useNavigationStateStore.setState({
      activeRoute: route,
      currentHistoryPosition: newPosition,
      canGoBack: true,
      exitWarningMessage: null,
    });
  } else {
    useNavigationStateStore.setState({
      activeRoute: route,
      exitWarningMessage: null,
    });
  }
});

interface UseNavigationState {
  activeRoute: Route;
  historyStack: Route[];
  currentHistoryPosition: number;
  canGoBack: boolean;
  exitWarningMessage: string | null;
  setExitWarningMessage(message: string | null): void;
  navigateTo(
    route: Route,
    options?: {
      ignoreExitWarning?: boolean;
      stateChangeType?: "push" | "replace";
    },
  ): void;
  goBack(): void;
}
export default function useNavigationState(): UseNavigationState {
  return useNavigationStateStore();
}

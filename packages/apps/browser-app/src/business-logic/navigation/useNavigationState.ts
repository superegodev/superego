import { create } from "zustand";
import type Route from "./Route.js";
import { RouteName } from "./Route.js";

const useNavigationStateStore = create<UseNavigationState>((set) => ({
  activeRoute: {
    name: RouteName.Home,
  },
  navigateTo(route) {
    set({ activeRoute: route });
  },
}));

interface UseNavigationState {
  activeRoute: Route;
  navigateTo(route: Route): void;
}
export default function useNavigationState(): UseNavigationState {
  return useNavigationStateStore();
}

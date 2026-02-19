import { Theme } from "@superego/backend";

export default function getMapStyle(theme: Theme): string {
  return theme === Theme.Dark
    ? "https://tiles.openfreemap.org/styles/fiord"
    : "https://tiles.openfreemap.org/styles/positron";
}

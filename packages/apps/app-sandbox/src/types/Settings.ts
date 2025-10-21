import type { Theme } from "@superego/backend";

export default interface Settings {
  theme: Theme.Light | Theme.Dark;
}

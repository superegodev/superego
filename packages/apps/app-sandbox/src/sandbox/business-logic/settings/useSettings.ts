import { useContext } from "react";
import type Settings from "../../../types/Settings.js";
import SettingsContext from "./SettingsContext.js";

export default function useSettings(): Settings {
  const settings = useContext(SettingsContext);
  if (settings === null) {
    throw new Error(
      "You must be inside a SettingsContext.Provider to use this hook.",
    );
  }
  return settings;
}

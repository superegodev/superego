import type ElectronMainWorld from "./ElectronMainWorld.js";

export const electronMainWorld: ElectronMainWorld =
  "isElectron" in window && window.isElectron
    ? {
        isElectron: true,
        backend: (window as any).backend,
        openInNativeBrowser: (window as any).openInNativeBrowser,
        openFileWithNativeApp: (window as any).openFileWithNativeApp,
        windowClose: (window as any).windowClose,
      }
    : {
        isElectron: false,
      };

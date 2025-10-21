import type AppComponent from "../../types/AppComponent.js";
import registerDependencies from "./registerDependencies.js";
import transpileImports from "./transpileImports.js";

const importCache = new Map<string, AppComponent>();
export default async function importApp(
  appCode: string,
): Promise<AppComponent> {
  const cachedApp = importCache.get(appCode);
  if (cachedApp) {
    return cachedApp;
  }
  registerDependencies();
  const transpiledAppCode = transpileImports(appCode);
  const moduleBlobUrl = URL.createObjectURL(
    new Blob([transpiledAppCode], { type: "text/javascript" }),
  );
  const { default: App } = await import(
    /* @vite-ignore */ moduleBlobUrl
  ).finally(() => URL.revokeObjectURL(moduleBlobUrl));
  importCache.set(appCode, App);
  return App;
}

import type AppComponent from "../AppComponent.js";
import transpileImports from "./transpileImports.js";

export default async function importApp(
  appCode: string,
): Promise<AppComponent> {
  const transpiledAppCode = transpileImports(appCode);
  const moduleBlobUrl = URL.createObjectURL(
    new Blob([transpiledAppCode], { type: "text/javascript" }),
  );
  const { default: App } = await import(
    /* @vite-ignore */ moduleBlobUrl
  ).finally(() => URL.revokeObjectURL(moduleBlobUrl));
  return App;
}

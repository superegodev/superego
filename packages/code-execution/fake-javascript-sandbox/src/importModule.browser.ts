import type { TypescriptModule } from "@superego/backend";

export default async function importModule(
  typescriptModule: TypescriptModule,
): Promise<unknown> {
  const moduleBlobUrl = URL.createObjectURL(
    new Blob([typescriptModule.compiled], { type: "text/javascript" }),
  );
  return import(/* @vite-ignore */ moduleBlobUrl).finally(() =>
    URL.revokeObjectURL(moduleBlobUrl),
  );
}

export default async function importModule(
  javascriptModule: string,
): Promise<unknown> {
  const moduleBlobUrl = URL.createObjectURL(
    new Blob([javascriptModule], { type: "text/javascript" }),
  );
  return import(/* @vite-ignore */ moduleBlobUrl).finally(() =>
    URL.revokeObjectURL(moduleBlobUrl),
  );
}

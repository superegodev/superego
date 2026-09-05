export default function getStatus({
  metadataChanged,
  sourceChanged,
  specChanged,
  stale,
}: {
  metadataChanged: boolean;
  sourceChanged: boolean;
  specChanged: boolean;
  stale: boolean;
}): string[] {
  const status: string[] = [];
  if (metadataChanged) {
    status.push("metadata changed");
  }
  if (sourceChanged) {
    status.push("source changed");
  }
  if (specChanged) {
    status.push("spec changed");
  }
  if (stale) {
    status.push("checkout stale");
  }
  if (status.length === 0) {
    status.push("clean");
  }
  return status;
}

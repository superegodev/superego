export default function getStatus({
  metadataChanged,
  sourceChanged,
  stale,
}: {
  metadataChanged: boolean;
  sourceChanged: boolean;
  stale: boolean;
}): string[] {
  const status: string[] = [];
  if (metadataChanged) {
    status.push("metadata changed");
  }
  if (sourceChanged) {
    status.push("source changed");
  }
  if (stale) {
    status.push("checkout stale");
  }
  if (status.length === 0) {
    status.push("clean");
  }
  return status;
}

export interface SnapshotEntry {
  testFileName: string;
  stepIndex: string;
  snapshotPath: string;
  requirementPath: string;
}

export interface EvaluationResult {
  testFileName: string;
  stepIndex: string;
  pass: boolean;
  reason: string;
}

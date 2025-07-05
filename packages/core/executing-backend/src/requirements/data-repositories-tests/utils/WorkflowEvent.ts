export default class WorkflowEvent {
  public readonly occurred: Promise<void>;
  public markOccurred!: () => void;

  constructor() {
    this.occurred = new Promise((resolve) => {
      this.markOccurred = resolve;
    });
  }
}

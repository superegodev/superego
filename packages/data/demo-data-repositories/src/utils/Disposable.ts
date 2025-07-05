export class DisposedError extends Error {
  constructor() {
    super(
      "The repository has been disposed and cannot perform any more operations",
    );
    this.name = "DisposedError";
  }
}

export default class Disposable {
  protected isDisposed = false;

  dispose() {
    this.isDisposed = true;
  }

  ensureNotDisposed() {
    if (this.isDisposed) {
      throw new DisposedError();
    }
  }
}

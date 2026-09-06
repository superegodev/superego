import type DataRepositories from "./DataRepositories.js";

export default interface DataRepositoriesManager {
  /**
   * Runs the supplied function inside a serializable transaction. The return
   * value of the function determines whether the transaction should be
   * committed, or rolled back. If the function throws, or if the commit
   * operation fails, the promise returned by runInTransaction rejects.
   *
   * Note: transactions are not nestable. If a serializable transaction is run
   * within another serializable transaction, the two transactions are isolated
   * from each other.
   */
  runInSerializableTransaction<ReturnValue>(
    fn: (repos: DataRepositories) => Promise<{
      action: "commit" | "rollback";
      returnValue: ReturnValue;
    }>,
  ): Promise<ReturnValue>;
}

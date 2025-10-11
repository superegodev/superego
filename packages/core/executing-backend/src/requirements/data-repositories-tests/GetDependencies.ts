import type DataRepositoriesManager from "../DataRepositoriesManager.js";

type GetDependencies = () => {
  dataRepositoriesManager: DataRepositoriesManager;
};
export default GetDependencies;

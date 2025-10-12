import type { Backend } from "@superego/backend";
import type { Connector } from "@superego/executing-backend";

type GetDependencies = (connector?: Connector<any, any>) => {
  backend: Backend;
};
export default GetDependencies;

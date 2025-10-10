import registerSessionStorageTests from "../../requirements/tests/SessionStorage.js";
import NodejsSessionStorage from "./NodejsSessionStorage.js";

registerSessionStorageTests(() => new NodejsSessionStorage());

import registerSessionStorageTests from "../../requirements/tests/SessionStorage.js";
import BrowserSessionStorage from "./BrowserSessionStorage.js";

registerSessionStorageTests(() => new BrowserSessionStorage());

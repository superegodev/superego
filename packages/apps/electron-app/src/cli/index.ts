import { cli } from "@superego/cli";
import pkg from "../../package.json" with { type: "json" };

await cli({ version: pkg.version });

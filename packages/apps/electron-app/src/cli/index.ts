import { cli } from "@superego/cli";
import pkg from "../../package.json" with { type: "json" };

cli({ version: pkg.version, description: pkg.description });

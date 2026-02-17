import { Command } from "commander";
import pkg from "../../package.json" with { type: "json" };

const program = new Command();

program.name("superego").version(pkg.version).description(pkg.description);

program
  .command("greet")
  .description("Print a greeting message")
  .argument("[name]", "name to greet", "world")
  .action((name: string) => {
    console.log(`Hello, ${name}!`);
  });

program.parse();

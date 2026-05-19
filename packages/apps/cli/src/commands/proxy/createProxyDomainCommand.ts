import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { readJsonInput } from "../shared/json.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import { runCommand } from "../shared/results.js";

type CliBackend = Awaited<ReturnType<typeof createCliBackend>>;
type BackendCall = (backend: CliBackend) => (...commandArguments: any[]) => any;

interface ProxyCommandDefinition {
  name: string;
  description: string;
  argumentCount: number;
  getCall: BackendCall;
}

export default function createProxyDomainCommand(
  name: string,
  description: string,
  definitions: ProxyCommandDefinition[],
): Command {
  const domain = useMarkdownHelp(new Command(name).description(description), {
    outputShape:
      '{ "success": true, "data": ... } | { "success": false, "error": ... }',
    notes: [
      "Proxy commands print backend Result JSON.",
      "Use command help for argument input shape.",
    ],
  });

  for (const definition of definitions) {
    domain.addCommand(createProxyCommand(definition));
  }

  return domain;
}

function createProxyCommand(definition: ProxyCommandDefinition): Command {
  const command = useMarkdownHelp(
    new Command(definition.name)
      .description(definition.description)
      .option(
        "-i, --input <path>",
        "JSON input file. Use - to read JSON from stdin.",
      ),
    {
      outputShape:
        '{ "success": true, "data": ... } | { "success": false, "error": ... }',
      sideEffects:
        definition.name === "list" || definition.name.startsWith("get")
          ? ["None."]
          : ["May mutate the default local Superego database."],
      failureCases: [
        "JSON input missing or invalid.",
        "Backend arguments invalid.",
        "Backend usecase-specific failure.",
      ],
      notes: [
        definition.argumentCount === 0
          ? "Takes no JSON input."
          : definition.argumentCount === 1
            ? "JSON input is the single command argument value."
            : `JSON input is an array of ${definition.argumentCount} command arguments.`,
      ],
    },
  );

  command.action(async (options: { input?: string }) => {
    await runCommand(async () => {
      const commandArguments = await readProxyArguments(
        definition.argumentCount,
        options.input,
      );
      const backend = await createCliBackend();
      return definition.getCall(backend)(...commandArguments);
    });
  });

  return command;
}

async function readProxyArguments(
  argumentCount: number,
  inputPath: string | undefined,
): Promise<unknown[]> {
  if (argumentCount === 0) {
    return [];
  }
  const input = await readJsonInput(inputPath);
  if (argumentCount === 1) {
    return [input];
  }
  if (!Array.isArray(input) || input.length !== argumentCount) {
    throw new Error(`Expected JSON array with ${argumentCount} items.`);
  }
  return input;
}

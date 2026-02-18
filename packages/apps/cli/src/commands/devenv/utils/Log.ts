import chalk from "chalk";

export default {
  info(message: string, indentation = 0): void {
    console.log(formatMessage(chalk.blue("[  info  ]"), message, indentation));
  },

  warning(message: string, indentation = 0): void {
    console.warn(
      formatMessage(chalk.yellow("[  warn  ]"), message, indentation),
    );
  },

  error(message: string, indentation = 0): void {
    console.error(formatMessage(chalk.red("[ error  ]"), message, indentation));
  },

  pass(message: string, indentation = 0): void {
    console.log(formatMessage(chalk.green("[  pass  ]"), message, indentation));
  },

  fail(message: string, indentation = 0): void {
    console.log(formatMessage(chalk.red("[  fail  ]"), message, indentation));
  },
};

function formatMessage(
  label: string,
  message: string,
  indentation: number,
): string {
  return `${label} ${"  ".repeat(indentation)}${message}`;
}

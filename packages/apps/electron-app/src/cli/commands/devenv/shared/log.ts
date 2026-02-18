import chalk from "chalk";

export default {
  info(message: string): void {
    console.log(`${chalk.blue("info")} ${message}`);
  },

  warning(message: string): void {
    console.warn(`${chalk.yellow("warn")} ${message}`);
  },

  error(message: string): void {
    console.error(`${chalk.red("error")} ${message}`);
  },
};

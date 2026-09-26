import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

export class ConsoleLogger extends AbstractLogger {
  info(message: string, context?: string): void {
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: string): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, context?: string): void {
    console.error(this.formatMessage("error", message, context));
  }

  debug(message: string, context?: string): void {
    console.debug(this.formatMessage("debug", message, context));
  }
}

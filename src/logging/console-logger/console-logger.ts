import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

export class ConsoleLogger extends AbstractLogger {
  info(message: string, context?: string): void {
    console.log(
      this.formatMessageAsText(this.createLogEntry("info", message, context)),
    );
  }

  warn(message: string, context?: string): void {
    console.warn(
      this.formatMessageAsText(this.createLogEntry("warn", message, context)),
    );
  }

  error(message: string, context?: string): void {
    console.error(
      this.formatMessageAsText(this.createLogEntry("error", message, context)),
    );
  }

  debug(message: string, context?: string): void {
    console.debug(
      this.formatMessageAsText(this.createLogEntry("debug", message, context)),
    );
  }
}

import type { Logger } from "../interfaces/logger.js";

export class ConsoleLogger implements Logger {
  private readonly appName: string;

  constructor(appName: string) {
    if (!appName || appName.trim().length === 0) {
      throw new Error("ConsoleLogger: appName must be a non-empty string");
    }
    this.appName = appName;
  }

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

  private sanitizeMessage(message: string): string {
    return !message || message.trim().length === 0
      ? "[empty message]"
      : message;
  }

  private formatTimestamp(): string {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const hh = String(now.getUTCHours()).padStart(2, "0");
    const min = String(now.getUTCMinutes()).padStart(2, "0");
    const ss = String(now.getUTCSeconds()).padStart(2, "0");
    const ms = String(now.getUTCMilliseconds()).padStart(3, "0");
    return `${yyyy}-${mm}-${dd}:${hh}:${min}:${ss}.${ms}`;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: string,
  ): string {
    const contextPart = context ? ` [${context}]` : "";
    return `${this.formatTimestamp()} [${this.appName}]${contextPart} ${level}: ${this.sanitizeMessage(message)}`;
  }
}

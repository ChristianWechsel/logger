import type { Logger } from "../interfaces/logger.js";

export abstract class AbstractLogger implements Logger {
  protected readonly appName: string;

  constructor(appName: string) {
    if (!appName || appName.trim().length === 0) {
      throw new Error(
        `${this.constructor.name}: appName must be a non-empty string`,
      );
    }
    this.appName = appName;
  }

  abstract info(message: string, context?: string): void;
  abstract warn(message: string, context?: string): void;
  abstract error(message: string, context?: string): void;
  abstract debug(message: string, context?: string): void;

  protected sanitizeMessage(message: string): string {
    return !message || message.trim().length === 0
      ? "[empty message]"
      : message;
  }

  protected formatTimestamp(): string {
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

  protected formatMessage(
    level: string,
    message: string,
    context?: string,
  ): string {
    const contextPart = context ? ` [${context}]` : "";
    return `${this.formatTimestamp()} [${this.appName}]${contextPart} ${level}: ${this.sanitizeMessage(message)}`;
  }
}

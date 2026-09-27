import type { Logger } from "../../interfaces/logger.js";
import type { LogEntry } from "../../types/log-entry.js";
import type { LogLevel } from "../../types/log-level.js";
import { TimeMonitoring } from "../../utils/time-monitoring.js";

export abstract class AbstractLogger implements Logger {
  protected readonly appName: string;
  protected readonly timeMonitoring: TimeMonitoring;

  constructor(appName: string) {
    if (!appName || appName.trim().length === 0) {
      throw new Error(
        `${this.constructor.name}: appName must be a non-empty string`,
      );
    }
    this.appName = appName;
    this.timeMonitoring = new TimeMonitoring();
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

  protected formatTimestamp(date: Date = new Date()): string {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const hh = String(date.getUTCHours()).padStart(2, "0");
    const min = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    const ms = String(date.getUTCMilliseconds()).padStart(3, "0");
    return `${yyyy}-${mm}-${dd}:${hh}:${min}:${ss}.${ms}`;
  }

  protected formatMessage(entry: LogEntry): string {
    const contextPart = entry.context ? ` [${entry.context}]` : "";
    return `${this.formatTimestamp(entry.timestamp)} [${this.appName}]${contextPart} ${entry.level}: ${this.sanitizeMessage(entry.message)}`;
  }

  protected formatMessageAsJson(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: this.formatTimestamp(entry.timestamp),
      appName: this.appName,
      level: entry.level,
      message: this.sanitizeMessage(entry.message),
      ...(entry.context ? { context: entry.context } : {}),
    });
  }

  protected createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
  ): LogEntry {
    const timestamp = new Date();
    this.timeMonitoring.newDate(timestamp);
    return { timestamp, level, message, context };
  }
}

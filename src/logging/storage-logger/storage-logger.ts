import type { LogEntry } from "../../types/log-entry.js";
import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

export interface IStorage {
  upload(data: LogEntry[]): Promise<void>;
}

export class StorageLogger extends AbstractLogger {
  private logs: LogEntry[];

  constructor(
    appName: string,
    private storage: IStorage,
  ) {
    super(appName);
    this.logs = [];
  }

  info(message: string, context?: string): void {
    this.logs.push(this.createLogEntry("info", message, context));
  }
  warn(message: string, context?: string): void {
    this.logs.push(this.createLogEntry("warn", message, context));
  }
  error(message: string, context?: string): void {
    this.logs.push(this.createLogEntry("error", message, context));
  }
  debug(message: string, context?: string): void {
    this.logs.push(this.createLogEntry("debug", message, context));
  }

  close(): Promise<void> {
    return this.storage.upload(this.logs);
  }
}

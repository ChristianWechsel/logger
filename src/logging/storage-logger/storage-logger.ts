import type { LogEntry } from "../../types/log-entry.js";
import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

export interface IStorage {
  upload(data: LogEntry[]): Promise<void>;
}

export class StorageLogger extends AbstractLogger {
  private logs: LogEntry[];
  private queueUploads: LogEntry[][];
  private listPendingUploads: Promise<void>[];

  constructor(
    appName: string,
    private storage: IStorage,
    private options: { batch: { threshold: number } } = {
      batch: { threshold: 50 },
    },
  ) {
    super(appName);
    this.logs = [];
    this.queueUploads = [];
    this.listPendingUploads = [];
  }

  info(message: string, context?: string): void {
    this.addLogEntry(this.createLogEntry("info", message, context));
  }
  warn(message: string, context?: string): void {
    this.addLogEntry(this.createLogEntry("warn", message, context));
  }
  error(message: string, context?: string): void {
    this.addLogEntry(this.createLogEntry("error", message, context));
  }
  debug(message: string, context?: string): void {
    this.addLogEntry(this.createLogEntry("debug", message, context));
  }

  close(): Promise<void> {
    return Promise.all(this.listPendingUploads).then(() => {
      return this.storage.upload(this.logs);
    });
  }

  private addLogEntry(logEntry: LogEntry): void {
    this.logs.push(logEntry);
    if (this.logs.length === this.options.batch.threshold) {
      this.queueUploads.push(this.logs);
      this.logs = [];
    }
    const next = this.queueUploads.shift();
    if (next) {
      const { uploadPromise, resolveUpload } = this.createUploadPromise();

      this.listPendingUploads.push(uploadPromise);
      this.storage.upload(next).then(resolveUpload);
    }
  }

  private createUploadPromise() {
    let resolveUpload: (value: void | PromiseLike<void>) => void = () => {};

    const uploadPromise = new Promise<void>((resolve) => {
      resolveUpload = resolve;
    });

    return { uploadPromise, resolveUpload };
  }
}

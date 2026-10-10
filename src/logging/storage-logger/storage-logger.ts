import type { LogEntry } from "../../types/log-entry.js";
import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

export interface IStorage {
  upload(data: LogEntry[]): Promise<void>;
}

export class StorageLogger extends AbstractLogger {
  private logs: LogEntry[];
  private queueUploads: LogEntry[][];
  private pendingUploads: Set<Promise<void>>;

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
    this.pendingUploads = new Set<Promise<void>>();
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

  close() {
    this.addCurrentLogsToQueueUpload();
    return Promise.all(this.pendingUploads);
  }

  private addLogEntry(logEntry: LogEntry): void {
    this.logs.push(logEntry);
    if (this.logs.length === this.options.batch.threshold) {
      this.addCurrentLogsToQueueUpload();
    }
  }

  private addCurrentLogsToQueueUpload(): void {
    if (this.logs.length > 0) {
      this.queueUploads.push(this.logs);
      this.logs = [];
      const next = this.queueUploads.shift();
      if (next) {
        const { uploadPromise, resolveUpload } = this.createUploadPromise();
        this.pendingUploads.add(uploadPromise);
        this.storage
          .upload(next)
          .then(() => {
            resolveUpload();
            this.pendingUploads.delete(uploadPromise);
          })
          .catch(() => {
            resolveUpload();
            this.pendingUploads.delete(uploadPromise);
          });
      }
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

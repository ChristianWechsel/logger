import type { LogEntry } from "../../types/log-entry.js";
import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

export interface IStorage {
  upload(data: LogEntry[]): Promise<void>;
}

export class StorageLogger extends AbstractLogger {
  private logs: LogEntry[];
  private queueUploads: LogEntry[][];
  private isUploading: Promise<void>;
  private resolveIsUploading?: () => void;
  private areUploadsPending: boolean;

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
    this.isUploading = new Promise<void>((resolve) => {
      this.resolveIsUploading = () => {
        resolve();
      };
    });
    this.areUploadsPending = false;
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
    if (this.areUploadsPending) {
      return this.isUploading.then(() => {
        return this.storage.upload(this.logs);
      });
    }
    return this.storage.upload(this.logs);
  }

  private addLogEntry(logEntry: LogEntry): void {
    this.logs.push(logEntry);
    if (this.logs.length === this.options.batch.threshold) {
      this.queueUploads.push(this.logs);
      this.logs = [];
    }
    const next = this.queueUploads.shift();
    if (next) {
      this.areUploadsPending = true;
      this.storage.upload(next).then(() => {
        this.areUploadsPending = false;
        this.resolveIsUploading?.();
      });
    }
  }
}

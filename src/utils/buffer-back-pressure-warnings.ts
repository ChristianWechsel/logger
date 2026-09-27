import type { Logger } from "../interfaces/logger.js";
import type { LogEntry } from "../types/log-entry.js";

export class BufferBackPressureWarnings {
  private buffer: LogEntry[] = [];

  constructor(private logger: Logger) {}

  add(): void {
    this.buffer.push({
      timestamp: new Date(),
      level: "warn",
      message: "Backpressure detected, write stream is full.",
    });
  }

  writeToLogs() {
    this.buffer.forEach((entry) => this.logger.warn(entry.message));
    this.buffer = [];
  }
}

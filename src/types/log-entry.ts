import type { LogLevel } from "./log-level.js";

export type LogEntry = {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
};

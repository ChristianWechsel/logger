import { createWriteStream, WriteStream } from "fs";
import { EOL } from "os";
import type { LogEntry } from "../../types/log-entry.js";
import { BooleanState } from "../../utils/boolean-state.js";
import { BufferBackPressureWarnings } from "../../utils/buffer-back-pressure-warnings.js";
import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

// FileRoation nach Datum implementieren => bei Tageswechsel
// Diese Funktionen in eigene Klassen auslagern, um Wiederverwendbarkeit zu erreichen
// Bei App Stop oder Absturz muss sichergestellt werden, dass alle Logs geschrieben werden
// Format frei gestalten, um als "console string" oder als JSON abzulegen, um es später
//    besser analysieren und verarbeiten zu können

export type LogFormat = "text" | "json";

export class FileLogger extends AbstractLogger {
  private readonly writeStream: WriteStream;
  private readonly format: LogFormat;
  private backPressureState: BooleanState;
  private bufferBackPressureWarnings: BufferBackPressureWarnings;

  constructor(appName: string, filePath: string, format: LogFormat = "text") {
    super(appName);
    if (!filePath || filePath.trim().length === 0) {
      throw new Error("FileLogger: filePath must be a non-empty string");
    }
    this.writeStream = createWriteStream(filePath, {
      flags: "a",
    });
    this.format = format;
    this.backPressureState = new BooleanState(true);
    this.bufferBackPressureWarnings = new BufferBackPressureWarnings(this);
  }

  info(message: string, context?: string): void {
    this.writeToFile(
      this.formatEntry(this.createLogEntry("info", message, context)),
    );
  }

  warn(message: string, context?: string): void {
    this.writeToFile(
      this.formatEntry(this.createLogEntry("warn", message, context)),
    );
  }

  error(message: string, context?: string): void {
    this.writeToFile(
      this.formatEntry(this.createLogEntry("error", message, context)),
    );
  }

  debug(message: string, context?: string): void {
    this.writeToFile(
      this.formatEntry(this.createLogEntry("debug", message, context)),
    );
  }

  private formatEntry(entry: LogEntry): string {
    return this.format === "json"
      ? this.formatMessageAsJson(entry)
      : this.formatMessage(entry);
  }

  private writeToFile(formattedMessage: string): void {
    if (this.backPressureState.hasStateSwitchedTrueToFalse()) {
      this.backPressureState.resetHasSwitchedTrueToFalse();
      this.bufferBackPressureWarnings.add();

      this.writeStream.once("drain", () => {
        this.backPressureState.updateStateIfChanged(true);
        this.bufferBackPressureWarnings.writeToLogs();
      });
    }
    if (this.backPressureState.getState()) {
      const hasNoBackPressure = this.writeStream.write(formattedMessage + EOL);
      this.backPressureState.updateStateIfChanged(hasNoBackPressure);
    }
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      this.writeStream.end(() => {
        resolve();
      });
    });
  }
}

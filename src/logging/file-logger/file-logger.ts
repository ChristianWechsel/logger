import { createWriteStream, WriteStream } from "fs";
import { EOL } from "os";
import { join } from "path";
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

export type FileLoggerFile = {
  pathFolder: string;
  extension: string;
};

export class FileLogger extends AbstractLogger {
  private writeStream: WriteStream;
  private backPressureState: BooleanState;
  private bufferBackPressureWarnings: BufferBackPressureWarnings;

  constructor(
    appName: string,
    private file: FileLoggerFile,
    private readonly format: LogFormat = "text",
  ) {
    super(appName);
    if (!file.pathFolder || file.pathFolder.trim().length === 0) {
      throw new Error("FileLogger: file.pathFolder must be a non-empty string");
    }
    if (!file.extension || file.extension.trim().length === 0) {
      throw new Error("FileLogger: file.extension must be a non-empty string");
    }

    const { writeStream, backPressureState } = this.createStream();
    this.writeStream = writeStream;
    this.backPressureState = backPressureState;
    this.bufferBackPressureWarnings = new BufferBackPressureWarnings(this);
    this.timeMonitoring.on("new-day", () => {
      this.rotateStream();
    });
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

  close(): Promise<void> {
    return new Promise((resolve) => {
      this.writeStream.end(() => {
        resolve();
      });
    });
  }

  private createStream() {
    const backPressureState = new BooleanState(true);
    const writeStream = createWriteStream(
      join(
        this.file.pathFolder,
        this.formatFileName({
          appName: this.appName,
          date: new Date(),
          extension: this.file.extension,
        }),
      ),
      {
        flags: "a",
      },
    );

    return { writeStream, backPressureState };
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

  private rotateStream() {
    const oldStream = this.writeStream;
    const { backPressureState, writeStream } = this.createStream();
    this.writeStream = writeStream;
    this.backPressureState = backPressureState;
    oldStream.end();
  }

  private formatEntry(entry: LogEntry): string {
    return this.format === "json"
      ? this.formatMessageAsJson(entry)
      : this.formatMessage(entry);
  }

  private formatFileName(params: {
    appName: string;
    date: Date;
    extension: string;
  }): string {
    return `${params.appName}.${params.date.toISOString().split("T")[0]}.${params.extension}`;
  }
}

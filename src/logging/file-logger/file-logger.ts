import { createWriteStream, WriteStream } from "fs";
import { BooleanState } from "../../utils/boolean-state.js";
import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

// FileRoation nach Datum implementieren => bei Tageswechsel
// Diese Funktionen in eigene Klassen auslagern, um Wiederverwendbarkeit zu erreichen
// Bei App Stop oder Absturz muss sichergestellt werden, dass alle Logs geschrieben werden
// Format frei gestalten, um als "console string" oder als JSON abzulegen, um es später
//    besser analysieren und verarbeiten zu können

export class FileLogger extends AbstractLogger {
  private readonly writeStream: WriteStream;
  private backPressureState: BooleanState;

  constructor(appName: string, filePath: string) {
    super(appName);
    if (!filePath || filePath.trim().length === 0) {
      throw new Error("FileLogger: filePath must be a non-empty string");
    }
    this.writeStream = createWriteStream(filePath, {
      flags: "a",
    });
    this.backPressureState = new BooleanState(true);
  }

  info(message: string, context?: string): void {
    this.writeToFile(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: string): void {
    this.writeToFile(this.formatMessage("warn", message, context));
  }

  error(message: string, context?: string): void {
    this.writeToFile(this.formatMessage("error", message, context));
  }

  debug(message: string, context?: string): void {
    this.writeToFile(this.formatMessage("debug", message, context));
  }

  private writeToFile(formattedMessage: string): void {
    if (this.backPressureState.hasStateSwitchedTrueToFalse()) {
      console.warn(
        "Backpressure detected, write stream is full",
        this.constructor.name,
      );
      this.backPressureState.resetHasSwitchedTrueToFalse();
      this.writeStream.once("drain", () => {
        this.backPressureState.updateStateIfChanged(true);
        console.info(this.constructor.name);
      });
    }
    if (this.backPressureState.getState()) {
      const hasNoBackPressure = this.writeStream.write(formattedMessage + "\n");
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

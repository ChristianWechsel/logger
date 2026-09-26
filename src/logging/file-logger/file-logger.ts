import { createWriteStream, WriteStream } from "fs";
import { AbstractLogger } from "../abstract-logger/abstract-logger.js";

// Mit Stream in File schreiben, um hochfrequente Logs sauber abfahren zu können
// ggf mit worker thread implementieren, um Schreiboperationen auszulagern
// FileRoation nach Datum implementieren => bei Tageswechsel
// Diese Funktionen in eigene Klassen auslagern, um Wiederverwendbarkeit zu erreichen
// Bei App Stop oder Absturz muss sichergestellt werden, dass alle Logs geschrieben werden
// Format frei gestalten, um als "console string" oder als JSON abzulegen, um es später
//    besser analysieren und verarbeiten zu können

export class FileLogger extends AbstractLogger {
  private readonly writeStream: WriteStream;

  constructor(appName: string, filePath: string) {
    super(appName);
    if (!filePath || filePath.trim().length === 0) {
      throw new Error("FileLogger: filePath must be a non-empty string");
    }
    this.writeStream = createWriteStream(filePath, { flags: "a" });
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
    this.writeStream.write(formattedMessage + "\n");
  }
}

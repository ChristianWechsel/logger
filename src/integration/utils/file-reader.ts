import { createReadStream, ReadStream } from "fs";
import { createInterface, Interface } from "readline";

export class FileReader {
  private readonly readStream: ReadStream;
  private readonly lineReader: Interface;

  constructor(
    filePath: string,
    private cb: {
      onData: (line: string) => void;
      onEnd: () => void;
    },
  ) {
    this.readStream = createReadStream(filePath, { encoding: "utf8" });
    this.lineReader = createInterface({
      input: this.readStream,
      crlfDelay: Infinity,
    });
    this.lineReader.on("line", (line) => this.cb.onData(line));
    this.lineReader.on("close", () => this.cb.onEnd());
  }
}

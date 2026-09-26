import { mkdir, rm } from "fs/promises";
import { resolve } from "path";
import { FileLogger } from "../logging/file-logger/file-logger.js";
import { FileReader } from "./utils/file-reader.js";

describe("FileLogger Integration Tests", () => {
  const pathTestFolder = resolve(process.cwd(), "tmp-test");
  const logFilePath = resolve(pathTestFolder, "app.log");

  beforeAll(async () => {
    try {
      console.debug(`Create test folder at ${pathTestFolder}`);
      await mkdir(pathTestFolder, { recursive: true });
    } catch (error) {
      console.error(`${error}`);
    }
  });

  afterAll(async () => {
    try {
      console.debug(`Delete test folder at ${pathTestFolder}`);
      await rm(pathTestFolder, { recursive: true });
    } catch (error) {
      console.error(`${error}`);
    }
  });

  it("should write formatted log entries to a file on disk", async () => {
    const logger = new FileLogger("integration-app", logFilePath);

    logger.info("application started");
    logger.error("connection failed", "DatabaseClient");

    await logger.close();

    await new Promise<void>((resolve, reject) => {
      const actual: string[] = [];

      new FileReader(logFilePath, {
        onData: (chunk) => {
          actual.push(chunk);
        },
        onEnd: () => {
          try {
            expect(actual).toHaveLength(2);
            expect(actual[0]).toMatch(
              /^\d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}\.\d{3} \[integration-app\] info: application started$/,
            );
            expect(actual[1]).toMatch(
              /^\d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}\.\d{3} \[integration-app\] \[DatabaseClient\] error: connection failed$/,
            );
            resolve();
          } catch (error) {
            reject(error);
          }
        },
      });
    });
  });

  // test mit 1 Mio log entries => heantasten, um Rechner nicht zu sprengen oder Disk zu überlasten
  // createReadFile, um die großen Log-Dateien effizient zu lesen
  // soll testen, ob bursts von Logs korrekt in Datei geschreiben werden kann
});

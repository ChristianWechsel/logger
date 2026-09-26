import { mkdir, readFile, rm } from "fs/promises";
import { resolve } from "path";
import { FileLogger } from "../logging/file-logger/file-logger.js";

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
    console.debug("finished writing logs");

    await logger.close();
    console.debug("stream closed");
    const fileContent = await readFile(logFilePath, "utf-8");
    const lines = fileContent.trim().split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(
      /^\d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}\.\d{3} \[integration-app\] info: application started$/,
    );
    expect(lines[1]).toMatch(
      /^\d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}\.\d{3} \[integration-app\] \[DatabaseClient\] error: connection failed$/,
    );
  });
});

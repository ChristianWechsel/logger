import { mkdir, rm } from "fs/promises";
import { resolve } from "path";
import { FileLogger } from "../logging/file-logger/file-logger.js";
import { FileLoggerIntegrationTestdata } from "./file-logger.testdata.js";
import { expectLogLines } from "./utils/expect-log-lines.js";
import { readLogFile } from "./utils/read-log-file.js";

describe("FileLogger Integration Tests", () => {
  const pathTestFolder = resolve(process.cwd(), "tmp-test");
  const appName = "integration-app";
  const testdata = new FileLoggerIntegrationTestdata();

  beforeAll(async () => {
    try {
      await mkdir(pathTestFolder, { recursive: true });
    } catch (error) {
      console.error(`${error}`);
    }
  });

  afterAll(async () => {
    try {
      await rm(pathTestFolder, { recursive: true });
    } catch (error) {
      console.error(`${error}`);
    }
  });

  it("should write formatted log entries to a file on disk", async () => {
    const logFilePath = resolve(pathTestFolder, "app.log");
    const logger = new FileLogger(appName, logFilePath);
    const { logCalls, expectedPatterns } =
      testdata.singleEntryScenario(appName);

    logCalls.forEach((call) => logger[call.level](call.message, call.context));

    await logger.close();

    const actual = await readLogFile(logFilePath);

    expectLogLines(actual, expectedPatterns);
  });

  it("should correctly write a large burst of log entries without losing or corrupting lines", async () => {
    const logFilePath = resolve(pathTestFolder, "burst.log");
    const logger = new FileLogger(appName, logFilePath);
    const entryCount = 250_000;
    const { logCalls, expectedPatterns } = testdata.burstEntryScenario(
      appName,
      entryCount,
    );

    logCalls.forEach((call) => logger[call.level](call.message, call.context));

    await logger.close();

    const actual = await readLogFile(logFilePath);

    expectLogLines(actual, expectedPatterns);
  });

  // rausfinden, ob highWaterMark bzw backpressure korrekt gehandhabt werden
});

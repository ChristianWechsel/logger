import { mkdir, rm } from "fs/promises";
import { resolve } from "path";
import { FileLogger } from "../logging/file-logger/file-logger.js";
import { FileLoggerIntegrationTestdata } from "./file-logger.testdata.js";
import {
  expectCountLogLines,
  expectLogLines,
} from "./utils/expect-log-lines.js";
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

  it("backpressure scenario: data loss minimal", async () => {
    const logFilePath = resolve(pathTestFolder, "burst.log");
    const logger = new FileLogger(appName, logFilePath);
    const { logCalls } = testdata.burstEntryScenario(appName, 10000);

    while (logCalls.length > 0) {
      const burst = logCalls.splice(0, 1000);
      burst.forEach((call) => logger[call.level](call.message, call.context));
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
    }

    await logger.close();

    const actual = await readLogFile(logFilePath);

    expectCountLogLines(actual, {
      count: logCalls.length,
      toleranceInPercente: 0.9,
    });
  });
});

import { mkdir, rm } from "fs/promises";
import { resolve } from "path";
import { FileLogger } from "../logging/file-logger/file-logger.js";
import { FileLoggerIntegrationTestdata } from "./file-logger.testdata.js";
import {
  expectCountLogLines,
  expectLogLines,
} from "./utils/expect-log-lines.js";
import { readLogFile } from "./utils/read-log-file.js";

function todayDateSegment(): string {
  return new Date().toISOString().split("T")[0];
}

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

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should write formatted log entries to a file on disk", async () => {
    const logFilePath = resolve(
      pathTestFolder,
      `${appName}.${todayDateSegment()}.log`,
    );
    const logger = new FileLogger(appName, {
      pathFolder: pathTestFolder,
      extension: "log",
    });
    const { logCalls, expectedPatterns } =
      testdata.singleEntryScenario(appName);

    logCalls.forEach((call) => logger[call.level](call.message, call.context));

    await logger.close();

    const actual = await readLogFile(logFilePath);

    expectLogLines(actual, expectedPatterns);
  });

  it("backpressure scenario: data loss minimal", async () => {
    const logFilePath = resolve(
      pathTestFolder,
      `${appName}.${todayDateSegment()}.burst.log`,
    );
    const logger = new FileLogger(appName, {
      pathFolder: pathTestFolder,
      extension: "burst.log",
    });
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

  it("backpressure scenario: writes a backpressure warning entry to the log", async () => {
    const logFilePath = resolve(
      pathTestFolder,
      `${appName}.${todayDateSegment()}.backpressure-warning.log`,
    );
    const logger = new FileLogger(appName, {
      pathFolder: pathTestFolder,
      extension: "backpressure-warning.log",
    });
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
    const backpressureWarningPattern =
      testdata.backpressureWarningPattern(appName);

    expect(actual.some((line) => backpressureWarningPattern.test(line))).toBe(
      true,
    );
  });

  it("day rotation: writes to a new file when the UTC day changes", async () => {
    jest.useFakeTimers({
      doNotFake: [
        "hrtime",
        "nextTick",
        "performance",
        "queueMicrotask",
        "requestAnimationFrame",
        "requestIdleCallback",
        "setImmediate",
        "clearImmediate",
        "setInterval",
        "clearInterval",
        "setTimeout",
        "clearTimeout",
      ],
    });
    jest.setSystemTime(new Date("2024-01-15T23:59:00.000Z"));

    const logger = new FileLogger(appName, {
      pathFolder: pathTestFolder,
      extension: "rotation.log",
    });

    logger.info("last entry on day one");

    jest.setSystemTime(new Date("2024-01-16T00:00:05.000Z"));
    logger.info("first entry on day two");

    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    await logger.close();

    const dayOneFile = await readLogFile(
      resolve(pathTestFolder, `${appName}.2024-01-15.rotation.log`),
    );
    const dayTwoFile = await readLogFile(
      resolve(pathTestFolder, `${appName}.2024-01-16.rotation.log`),
    );

    expect(dayOneFile).toHaveLength(1);
    expect(dayOneFile[0]).toContain("last entry on day one");
    expect(dayTwoFile).toHaveLength(1);
    expect(dayTwoFile[0]).toContain("first entry on day two");
  });
});

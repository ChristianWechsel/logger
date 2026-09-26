import { createWriteStream } from "fs";
import { FileLogger } from "./file-logger.js";
import {
  FileLoggerTestdataFactory,
  FIXED_DATE,
} from "./file-logger.testdata.js";

jest.mock("fs");

const mockedCreateWriteStream = createWriteStream as jest.MockedFunction<
  typeof createWriteStream
>;

describe("FileLogger", () => {
  const writeMock = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
    writeMock.mockClear();
    mockedCreateWriteStream.mockReturnValue({
      write: writeMock,
    } as unknown as ReturnType<typeof createWriteStream>);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("fail-fast validation", () => {
    it("throws when appName is empty", () => {
      expect(() => new FileLogger("", "app.log")).toThrow(
        "FileLogger: appName must be a non-empty string",
      );
    });

    it("throws when appName is blank", () => {
      expect(() => new FileLogger("   ", "app.log")).toThrow(
        "FileLogger: appName must be a non-empty string",
      );
    });

    it("throws when filePath is empty", () => {
      expect(() => new FileLogger("test-app", "")).toThrow(
        "FileLogger: filePath must be a non-empty string",
      );
    });

    it("throws when filePath is blank", () => {
      expect(() => new FileLogger("test-app", "   ")).toThrow(
        "FileLogger: filePath must be a non-empty string",
      );
    });
  });

  describe("logging methods", () => {
    const testData = new FileLoggerTestdataFactory();

    it.each([
      testData.info(),
      testData.warn(),
      testData.error(),
      testData.debug(),
    ])("$name", ({ level, message, context, expectedOutput }) => {
      const logger = new FileLogger("test-app", "app.log");

      logger[level](message, context);

      expect(writeMock).toHaveBeenCalledWith(expectedOutput);
    });
  });
});

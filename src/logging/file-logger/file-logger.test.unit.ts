import { EventEmitter } from "events";
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

function createMockWriteStream() {
  const stream = new EventEmitter() as EventEmitter & {
    write: jest.Mock;
    end: jest.Mock;
  };
  stream.write = jest.fn();
  stream.end = jest.fn((callback?: () => void) => callback?.());
  return stream;
}

describe("FileLogger", () => {
  let mockWriteStream: ReturnType<typeof createMockWriteStream>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
    mockWriteStream = createMockWriteStream();
    mockedCreateWriteStream.mockReturnValue(
      mockWriteStream as unknown as ReturnType<typeof createWriteStream>,
    );
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

      expect(mockWriteStream.write).toHaveBeenCalledWith(expectedOutput);
    });
  });

  describe("json format", () => {
    const testData = new FileLoggerTestdataFactory();

    it.each([testData.info_as_json(), testData.debug_as_json()])(
      "$name",
      ({ level, message, context, format, expectedOutput }) => {
        const logger = new FileLogger("test-app", "app.log", format);

        logger[level](message, context);

        expect(mockWriteStream.write).toHaveBeenCalledWith(expectedOutput);
      },
    );
  });

  describe("close", () => {
    it("resolves when the underlying stream finishes successfully", async () => {
      const logger = new FileLogger("test-app", "app.log");

      await expect(logger.close()).resolves.toBeUndefined();
      expect(mockWriteStream.end).toHaveBeenCalledTimes(1);
    });

    it("rejects when the underlying stream emits an error instead of finishing", async () => {
      const streamError = new Error("write failed");
      mockWriteStream.end.mockImplementation(() => {
        mockWriteStream.emit("error", streamError);
      });
      const logger = new FileLogger("test-app", "app.log");

      await expect(logger.close()).rejects.toThrow("write failed");
    });
  });
});

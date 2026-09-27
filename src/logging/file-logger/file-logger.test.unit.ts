import { EventEmitter } from "events";
import { createWriteStream } from "fs";
import { join } from "path";
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
      expect(
        () => new FileLogger("", { pathFolder: ".", extension: "log" }),
      ).toThrow("FileLogger: appName must be a non-empty string");
    });

    it("throws when appName is blank", () => {
      expect(
        () => new FileLogger("   ", { pathFolder: ".", extension: "log" }),
      ).toThrow("FileLogger: appName must be a non-empty string");
    });

    it("throws when pathFolder is empty", () => {
      expect(
        () => new FileLogger("test-app", { pathFolder: "", extension: "log" }),
      ).toThrow("FileLogger: file.pathFolder must be a non-empty string");
    });

    it("throws when pathFolder is blank", () => {
      expect(
        () =>
          new FileLogger("test-app", { pathFolder: "   ", extension: "log" }),
      ).toThrow("FileLogger: file.pathFolder must be a non-empty string");
    });

    it("throws when extension is empty", () => {
      expect(
        () => new FileLogger("test-app", { pathFolder: ".", extension: "" }),
      ).toThrow("FileLogger: file.extension must be a non-empty string");
    });

    it("throws when extension is blank", () => {
      expect(
        () => new FileLogger("test-app", { pathFolder: ".", extension: "   " }),
      ).toThrow("FileLogger: file.extension must be a non-empty string");
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
      const logger = new FileLogger("test-app", {
        pathFolder: ".",
        extension: "log",
      });

      logger[level](message, context);

      expect(mockWriteStream.write).toHaveBeenCalledWith(expectedOutput);
    });
  });

  describe("json format", () => {
    const testData = new FileLoggerTestdataFactory();

    it.each([testData.info_as_json(), testData.debug_as_json()])(
      "$name",
      ({ level, message, context, format, expectedOutput }) => {
        const logger = new FileLogger(
          "test-app",
          { pathFolder: ".", extension: "log" },
          format,
        );

        logger[level](message, context);

        expect(mockWriteStream.write).toHaveBeenCalledWith(expectedOutput);
      },
    );
  });

  describe("backpressure handling", () => {
    it("buffers a warning while back-pressured and flushes it once the stream drains", () => {
      mockWriteStream.write.mockReturnValueOnce(false).mockReturnValue(true);
      const logger = new FileLogger("test-app", {
        pathFolder: ".",
        extension: "log",
      });

      logger.info("first message");
      logger.info("second message");

      expect(mockWriteStream.write).toHaveBeenCalledTimes(1);

      mockWriteStream.emit("drain");

      expect(mockWriteStream.write).toHaveBeenCalledTimes(2);
      expect(mockWriteStream.write).toHaveBeenLastCalledWith(
        expect.stringContaining(
          "warn: Backpressure detected, write stream is full.",
        ),
      );
    });

    it("resumes writing normally after the backpressure warning has been flushed", () => {
      mockWriteStream.write.mockReturnValueOnce(false).mockReturnValue(true);
      const logger = new FileLogger("test-app", {
        pathFolder: ".",
        extension: "log",
      });
      logger.info("first message");
      logger.info("second message");
      mockWriteStream.emit("drain");
      mockWriteStream.write.mockClear();

      logger.info("third message");

      expect(mockWriteStream.write).toHaveBeenCalledWith(
        expect.stringContaining("info: third message"),
      );
    });
  });

  describe("file naming", () => {
    it("creates the write stream using appName.date.extension", () => {
      new FileLogger("test-app", { pathFolder: "logs", extension: "log" });

      expect(mockedCreateWriteStream).toHaveBeenCalledWith(
        join("logs", "test-app.2024-01-15.log"),
        { flags: "a" },
      );
    });
  });

  describe("day rotation", () => {
    it("opens a new stream for the new day and closes the previous one", () => {
      const logger = new FileLogger("test-app", {
        pathFolder: "logs",
        extension: "log",
      });
      const nextStream = createMockWriteStream();
      mockedCreateWriteStream.mockReturnValueOnce(
        nextStream as unknown as ReturnType<typeof createWriteStream>,
      );

      jest.setSystemTime(new Date("2024-01-16T00:00:00.000Z"));
      logger.info("first message on the new day");

      expect(mockWriteStream.end).toHaveBeenCalledTimes(1);
      expect(mockedCreateWriteStream).toHaveBeenLastCalledWith(
        join("logs", "test-app.2024-01-16.log"),
        { flags: "a" },
      );
      expect(nextStream.write).toHaveBeenCalledWith(
        expect.stringContaining("info: first message on the new day"),
      );
    });

    it("does not rotate when logging again within the same day", () => {
      const logger = new FileLogger("test-app", {
        pathFolder: "logs",
        extension: "log",
      });
      mockedCreateWriteStream.mockClear();

      logger.info("still the same day");

      expect(mockedCreateWriteStream).not.toHaveBeenCalled();
    });

    it("resets the backpressure state for the newly rotated stream", () => {
      mockWriteStream.write.mockReturnValue(false);
      const logger = new FileLogger("test-app", {
        pathFolder: "logs",
        extension: "log",
      });
      logger.info("first message");

      const nextStream = createMockWriteStream();
      nextStream.write.mockReturnValue(true);
      mockedCreateWriteStream.mockReturnValueOnce(
        nextStream as unknown as ReturnType<typeof createWriteStream>,
      );

      jest.setSystemTime(new Date("2024-01-16T00:00:00.000Z"));
      logger.info("second message on new day");

      expect(nextStream.write).toHaveBeenCalledWith(
        expect.stringContaining("info: second message on new day"),
      );
    });
  });

  describe("close", () => {
    it("resolves when the underlying stream finishes successfully", async () => {
      const logger = new FileLogger("test-app", {
        pathFolder: ".",
        extension: "log",
      });

      await expect(logger.close()).resolves.toBeUndefined();
      expect(mockWriteStream.end).toHaveBeenCalledTimes(1);
    });

    it("rejects when the underlying stream emits an error instead of finishing", async () => {
      const streamError = new Error("write failed");
      mockWriteStream.end.mockImplementation(() => {
        mockWriteStream.emit("error", streamError);
      });
      const logger = new FileLogger("test-app", {
        pathFolder: ".",
        extension: "log",
      });

      await expect(logger.close()).rejects.toThrow("write failed");
    });
  });
});

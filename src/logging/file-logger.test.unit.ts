import { FileLogger } from "./file-logger.js";
import { FileLoggerTestdataFactory } from "./file-logger.testdata.js";

describe("FileLogger", () => {
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
    ])("$name", ({ level, message, context }) => {
      const logger = new FileLogger("test-app", "app.log");

      expect(() => logger[level](message, context)).toThrow(
        "FileLogger.writeToFile: not implemented yet",
      );
    });
  });
});
